/**
 * Módulo de Autenticação Segura & Sincronização em Nuvem (Firebase Auth + Firestore)
 * Permite que o usuário crie conta com E-mail e Senha e faça login com segurança.
 * Todos os dados são sincronizados automaticamente na nuvem vinculados ao seu ID único (UID).
 */

import { Storage } from './storage.js';

export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAsDZZp8sUYzynhztz77g0dmtLf7sdqq24",
  authDomain: "projeto-academia-8efb6.firebaseapp.com",
  projectId: "projeto-academia-8efb6",
  storageBucket: "projeto-academia-8efb6.firebasestorage.app",
  messagingSenderId: "5740952799",
  appId: "1:5740952799:web:c7f0699dbbfdb59acc7d6a"
};

const SESSION_KEY = 'fit_auth_session_v1';
let autoSyncTimeout = null;

export const Auth = {
  // Retorna a sessão ativa salva no localStorage
  getSession() {
    return Storage.get(SESSION_KEY, null);
  },

  isAuthenticated() {
    const session = this.getSession();
    return Boolean(session && session.uid && session.idToken);
  },

  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    return {
      uid: session.uid,
      email: session.email,
      displayName: session.displayName || session.email?.split('@')[0] || "Atleta"
    };
  },

  saveSession(data) {
    const expiresAt = Date.now() + (Number(data.expiresIn || 3600) * 1000);
    const session = {
      uid: data.localId || data.uid,
      email: data.email,
      displayName: data.displayName || data.email?.split('@')[0] || "Atleta",
      idToken: data.idToken,
      refreshToken: data.refreshToken,
      expiresAt
    };
    Storage.set(SESSION_KEY, session);
    return session;
  },

  clearSession() {
    localStorage.removeItem(SESSION_KEY);
  },

  // Garante um ID Token válido, renovando automaticamente se expirou
  async getValidToken() {
    const session = this.getSession();
    if (!session) return null;

    // Se o token ainda é válido por mais de 2 minutos
    if (session.expiresAt && Date.now() < (session.expiresAt - 120000)) {
      return session.idToken;
    }

    // Renova o token via refreshToken
    if (!session.refreshToken) return session.idToken;

    try {
      const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_CONFIG.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=refresh_token&refresh_token=${session.refreshToken}`
      });

      if (res.ok) {
        const json = await res.json();
        session.idToken = json.id_token;
        session.refreshToken = json.refresh_token;
        session.expiresAt = Date.now() + (Number(json.expires_in || 3600) * 1000);
        Storage.set(SESSION_KEY, session);
        return session.idToken;
      }
    } catch (e) {
      console.warn('Erro ao renovar token:', e);
    }
    return session.idToken;
  },

  // Cadastro por E-mail e Senha
  async signUp(email, password, displayName = "") {
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_CONFIG.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          returnSecureToken: true
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: this._translateError(data.error?.message) };
      }

      // Se passou o nome de exibição, atualiza o perfil no Firebase
      if (displayName && displayName.trim()) {
        try {
          await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:update?key=${FIREBASE_CONFIG.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idToken: data.idToken,
              displayName: displayName.trim(),
              returnSecureToken: true
            })
          });
          data.displayName = displayName.trim();
        } catch (_) {}
      }

      const session = this.saveSession(data);

      // Sincroniza dados locais iniciais para a nuvem
      await this.syncToCloud();

      return { success: true, user: session };
    } catch (e) {
      return { success: false, message: `Erro de conexão: ${e.message}` };
    }
  },

  // Login por E-mail e Senha
  async signIn(email, password) {
    try {
      const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_CONFIG.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          returnSecureToken: true
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, message: this._translateError(data.error?.message) };
      }

      const session = this.saveSession(data);

      // Ao logar, busca os dados da nuvem do usuário
      const cloudRes = await this.loadFromCloud();
      if (!cloudRes.found) {
        // Se ainda não tem dados na nuvem, salva o estado atual
        await this.syncToCloud();
      }

      return { success: true, user: session, cloudDataLoaded: cloudRes.success };
    } catch (e) {
      return { success: false, message: `Erro de conexão: ${e.message}` };
    }
  },

  // Logout
  signOut() {
    this.clearSession();
    return { success: true };
  },

  // Sincronização Invisível na Nuvem (Firestore)
  async syncToCloud() {
    if (!this.isAuthenticated()) return { success: false, message: "Não autenticado." };

    try {
      const session = this.getSession();
      const token = await this.getValidToken();
      const backupData = JSON.parse(Storage.exportBackup());
      const docPath = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${session.uid}`;

      const res = await fetch(`${docPath}?key=${FIREBASE_CONFIG.apiKey}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fields: {
            appData: { stringValue: JSON.stringify(backupData) },
            email: { stringValue: session.email || '' },
            displayName: { stringValue: session.displayName || '' },
            updatedAt: { stringValue: new Date().toISOString() }
          }
        })
      });

      if (res.ok) {
        return { success: true };
      } else {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error?.message };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Carrega os dados da nuvem do usuário autenticado
  async loadFromCloud() {
    if (!this.isAuthenticated()) return { success: false, message: "Não autenticado." };

    try {
      const session = this.getSession();
      const token = await this.getValidToken();
      const docPath = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents/users/${session.uid}`;

      const res = await fetch(`${docPath}?key=${FIREBASE_CONFIG.apiKey}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        return { success: false, found: false, message: "Documento não encontrado na nuvem." };
      }

      const json = await res.json();
      const dataStr = json.fields?.appData?.stringValue;
      if (dataStr) {
        const importResult = Storage.importBackup(dataStr);
        return { success: importResult.success, found: true };
      }
      return { success: false, found: false };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // Sincronização automática em segundo plano (silenciosa)
  scheduleAutoSync(delayMs = 3500) {
    if (!this.isAuthenticated()) return;
    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(() => {
      this.syncToCloud().catch(err => console.warn('AutoSync silencioso falhou:', err));
    }, delayMs);
  },

  // Tradução amigável de erros do Firebase Auth
  _translateError(firebaseError = "") {
    if (firebaseError.includes('CONFIGURATION_NOT_FOUND')) {
      return "O serviço de Autenticação ainda não foi ativado no Console do Firebase. Vá em Firebase Console > Authentication > Primeiros Passos > Ativar E-mail/Senha.";
    }
    if (firebaseError.includes('EMAIL_EXISTS')) {
      return "Este e-mail já está cadastrado. Alterne para a aba 'Entrar' e faça login.";
    }
    if (firebaseError.includes('INVALID_LOGIN_CREDENTIALS') || firebaseError.includes('INVALID_PASSWORD')) {
      return "E-mail ou senha incorretos. Verifique suas credenciais.";
    }
    if (firebaseError.includes('EMAIL_NOT_FOUND')) {
      return "Nenhuma conta cadastrada com este e-mail. Crie sua conta primeiro.";
    }
    if (firebaseError.includes('WEAK_PASSWORD')) {
      return "A senha deve ter pelo menos 6 caracteres.";
    }
    if (firebaseError.includes('INVALID_EMAIL')) {
      return "Formato de e-mail inválido. Digite um e-mail correto.";
    }
    if (firebaseError.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) {
      return "Muitas tentativas sem sucesso. Aguarde alguns instantes e tente novamente.";
    }
    return `Erro ao autenticar: ${firebaseError}`;
  }
};
