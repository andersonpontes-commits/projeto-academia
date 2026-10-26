/**
 * Módulo de Sincronização em Nuvem via Firebase Firestore
 * Conectado ao projeto: projeto-academia-8efb6
 * Permite sincronizar os dados entre múltiplos dispositivos com segurança e rapidez via REST API.
 */

import { Storage } from './storage.js';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAsDZZp8sUYzynhztz77g0dmtLf7sdqq24",
  authDomain: "projeto-academia-8efb6.firebaseapp.com",
  projectId: "projeto-academia-8efb6",
  storageBucket: "projeto-academia-8efb6.firebasestorage.app",
  messagingSenderId: "5740952799",
  appId: "1:5740952799:web:c7f0699dbbfdb59acc7d6a",
  userToken: "meu_treino_pessoal"
};

let autoSyncTimeout = null;

export const FirebaseSync = {
  isConfigured() {
    const cfg = this.getConfig();
    return Boolean(cfg && cfg.apiKey && cfg.projectId);
  },

  getConfig() {
    const saved = Storage.get('fit_firebase_cfg_v1', null);
    return { ...DEFAULT_FIREBASE_CONFIG, ...(saved || {}) };
  },

  saveConfig(partialConfig) {
    const current = this.getConfig();
    const updated = { ...current, ...partialConfig };
    Storage.set('fit_firebase_cfg_v1', updated);
    return updated;
  },

  getLastSyncTime() {
    return Storage.get('fit_last_cloud_sync', null);
  },

  // Sincroniza todos os treinos, dietas e perfis para a nuvem
  async syncToCloud() {
    if (!this.isConfigured()) {
      return { success: false, message: "Firebase ainda não configurado." };
    }

    try {
      const cfg = this.getConfig();
      const backupData = JSON.parse(Storage.exportBackup());
      const userDoc = encodeURIComponent(cfg.userToken?.trim() || 'meu_treino_pessoal');
      const docPath = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/users/${userDoc}`;

      const res = await fetch(`${docPath}?key=${cfg.apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            appData: { stringValue: JSON.stringify(backupData) },
            updatedAt: { stringValue: new Date().toISOString() },
            appVersion: { stringValue: "1.0" },
            userToken: { stringValue: cfg.userToken || 'meu_treino_pessoal' }
          }
        })
      });

      if (res.ok) {
        const nowIso = new Date().toISOString();
        Storage.set('fit_last_cloud_sync', nowIso);
        return { 
          success: true, 
          message: `Sincronizado na nuvem com sucesso! (${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})`,
          timestamp: nowIso
        };
      } else {
        const err = await res.json().catch(() => ({}));
        return { 
          success: false, 
          message: err.error?.message || `Erro HTTP ${res.status} ao sincronizar no Firestore.` 
        };
      }
    } catch (e) {
      return { success: false, message: `Erro de conexão: ${e.message}` };
    }
  },

  // Carrega e restaura os dados da nuvem para o aparelho atual
  async loadFromCloud() {
    if (!this.isConfigured()) {
      return { success: false, message: "Firebase ainda não configurado." };
    }

    try {
      const cfg = this.getConfig();
      const userDoc = encodeURIComponent(cfg.userToken?.trim() || 'meu_treino_pessoal');
      const docPath = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/users/${userDoc}`;

      const res = await fetch(`${docPath}?key=${cfg.apiKey}`);
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          return { success: false, message: "Nenhum dado encontrado na nuvem para este Perfil ainda. Clique em 'Salvar na Nuvem' primeiro." };
        }
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error?.message || `Erro HTTP ${res.status} ao carregar dados.` };
      }

      const json = await res.json();
      const dataStr = json.fields?.appData?.stringValue;
      if (dataStr) {
        const importResult = Storage.importBackup(dataStr);
        if (importResult.success) {
          const nowIso = new Date().toISOString();
          Storage.set('fit_last_cloud_sync', nowIso);
          return { 
            success: true, 
            message: "Dados restaurados da nuvem com sucesso!",
            timestamp: nowIso
          };
        } else {
          return { success: false, message: "Falha ao processar os dados recebidos: " + importResult.error };
        }
      }
      return { success: false, message: "O documento salvo na nuvem estava vazio." };
    } catch (e) {
      return { success: false, message: `Erro de conexão: ${e.message}` };
    }
  },

  // Auto-sync com debounce para não sobrecarregar
  scheduleAutoSync(delayMs = 4000) {
    if (autoSyncTimeout) clearTimeout(autoSyncTimeout);
    autoSyncTimeout = setTimeout(async () => {
      try {
        const res = await this.syncToCloud();
        const statusEl = document.getElementById('firebaseSyncStatus');
        if (statusEl && res.success) {
          statusEl.textContent = `☁ Nuvem atualizada às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
          statusEl.style.color = 'var(--primary)';
        }
      } catch (err) {
        console.warn('AutoSync falhou silenciosamente:', err);
      }
    }, delayMs);
  }
};
