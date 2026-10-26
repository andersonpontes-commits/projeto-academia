/**
 * Módulo de Sincronização em Nuvem via Firebase Firestore (opcional)
 * Permite sincronizar os dados entre múltiplos dispositivos sem exigir tela de login/senha.
 */

import { Storage } from './storage.js';

export const FirebaseSync = {
  isConfigured() {
    const cfg = Storage.get('fit_firebase_cfg_v1', null);
    return Boolean(cfg && cfg.apiKey && cfg.projectId);
  },

  getConfig() {
    return Storage.get('fit_firebase_cfg_v1', {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      userToken: "meu_treino_pessoal"
    });
  },

  saveConfig(config) {
    Storage.set('fit_firebase_cfg_v1', config);
  },

  // Simulação / Preparação para Firestore REST API ou SDK
  async syncToCloud() {
    if (!this.isConfigured()) {
      return { success: false, message: "Firebase ainda não configurado (dados salvos localmente)." };
    }

    try {
      const cfg = this.getConfig();
      const backupData = JSON.parse(Storage.exportBackup());
      const docPath = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/users/${cfg.userToken || 'default_user'}`;

      // Gravação direta via REST API do Firestore sem necessidade de SDK pesado
      const res = await fetch(`${docPath}?key=${cfg.apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: {
            appData: { stringValue: JSON.stringify(backupData) },
            updatedAt: { stringValue: new Date().toISOString() }
          }
        })
      });

      if (res.ok) {
        return { success: true, message: "Sincronizado na nuvem com sucesso!" };
      } else {
        const err = await res.json();
        return { success: false, message: err.error?.message || "Erro na sincronização Firestore" };
      }
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  async loadFromCloud() {
    if (!this.isConfigured()) {
      return { success: false, message: "Firebase ainda não configurado." };
    }

    try {
      const cfg = this.getConfig();
      const docPath = `https://firestore.googleapis.com/v1/projects/${cfg.projectId}/databases/(default)/documents/users/${cfg.userToken || 'default_user'}`;

      const res = await fetch(`${docPath}?key=${cfg.apiKey}`);
      if (!res.ok) {
        return { success: false, message: "Nenhum dado encontrado na nuvem para este usuário." };
      }

      const json = await res.json();
      const dataStr = json.fields?.appData?.stringValue;
      if (dataStr) {
        Storage.importBackup(dataStr);
        return { success: true, message: "Dados restaurados da nuvem com sucesso!" };
      }
      return { success: false, message: "Documento da nuvem vazio." };
    } catch (e) {
      return { success: false, message: e.message };
    }
  }
};
