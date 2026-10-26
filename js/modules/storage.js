/**
 * Gerenciador de armazenamento local com suporte a múltiplos perfis individuais
 * e Estratégia de Acompanhamento (Básico, Médio, Avançado).
 */

const STORAGE_KEYS = {
  ACTIVE_PROFILE_ID: 'fit_active_profile_id_v2',
  PROFILES_INDEX: 'fit_profiles_index_v2',
  CUSTOM_FOODS_GLOBAL: 'fit_custom_foods_global_v2'
};

const DEFAULT_PROFILE_DATA = {
  name: "Atleta",
  strategy: "basic", // 'basic' | 'medium' | 'advanced'
  age: 25,
  height: 175,
  initialWeight: 75.0,
  targetWeight: 70.0,
  targetWeeks: 12,
  dailyCalories: 2200,
  dailyProtein: 150,
  dailyCarbs: 220,
  dailyFat: 60,
  dailyWater: 2500,
  hasCompletedOnboarding: false
};

const DEFAULT_WORKOUTS = {
  mon: {
    name: "Segunda: Peito & Tríceps",
    exercises: [
      { id: "ex1", name: "Supino Reto com Barra", youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg", sets: [ { reps: 10, weight: 60, done: false }, { reps: 10, weight: 60, done: false }, { reps: 8, weight: 65, done: false } ] },
      { id: "ex2", name: "Supino Inclinado com Halteres", youtubeUrl: "", sets: [ { reps: 10, weight: 22, done: false }, { reps: 10, weight: 22, done: false }, { reps: 10, weight: 22, done: false } ] },
      { id: "ex3", name: "Crucifixo / Crossover na Polia", youtubeUrl: "", sets: [ { reps: 12, weight: 15, done: false }, { reps: 12, weight: 15, done: false }, { reps: 12, weight: 15, done: false } ] },
      { id: "ex4", name: "Tríceps Corda na Polia", youtubeUrl: "", sets: [ { reps: 12, weight: 25, done: false }, { reps: 12, weight: 25, done: false }, { reps: 10, weight: 30, done: false } ] },
      { id: "ex5", name: "Tríceps Francês com Halter", youtubeUrl: "", sets: [ { reps: 10, weight: 12, done: false }, { reps: 10, weight: 12, done: false }, { reps: 10, weight: 12, done: false } ] }
    ]
  },
  tue: {
    name: "Terça: Costas & Bíceps",
    exercises: [
      { id: "ex6", name: "Puxada Frontal Aberta", youtubeUrl: "", sets: [ { reps: 10, weight: 50, done: false }, { reps: 10, weight: 50, done: false }, { reps: 10, weight: 55, done: false } ] },
      { id: "ex7", name: "Remada Curvada com Barra", youtubeUrl: "", sets: [ { reps: 10, weight: 45, done: false }, { reps: 10, weight: 45, done: false }, { reps: 8, weight: 50, done: false } ] },
      { id: "ex8", name: "Remada Baixa na Polia", youtubeUrl: "", sets: [ { reps: 12, weight: 40, done: false }, { reps: 12, weight: 40, done: false }, { reps: 12, weight: 40, done: false } ] },
      { id: "ex9", name: "Rosca Direta com Barra W", youtubeUrl: "", sets: [ { reps: 10, weight: 14, done: false }, { reps: 10, weight: 14, done: false }, { reps: 8, weight: 16, done: false } ] },
      { id: "ex10", name: "Rosca Martelo com Halteres", youtubeUrl: "", sets: [ { reps: 12, weight: 12, done: false }, { reps: 12, weight: 12, done: false }, { reps: 12, weight: 12, done: false } ] }
    ]
  },
  wed: {
    name: "Quarta: Pernas Completo & Panturrilha",
    exercises: [
      { id: "ex11", name: "Agachamento Livre / Máquina", youtubeUrl: "", sets: [ { reps: 10, weight: 70, done: false }, { reps: 10, weight: 70, done: false }, { reps: 8, weight: 80, done: false } ] },
      { id: "ex12", name: "Leg Press 45°", youtubeUrl: "", sets: [ { reps: 12, weight: 160, done: false }, { reps: 12, weight: 160, done: false }, { reps: 10, weight: 180, done: false } ] },
      { id: "ex13", name: "Cadeira Extensora", youtubeUrl: "", sets: [ { reps: 15, weight: 45, done: false }, { reps: 12, weight: 50, done: false }, { reps: 12, weight: 50, done: false } ] },
      { id: "ex14", name: "Mesa Flexora", youtubeUrl: "", sets: [ { reps: 12, weight: 35, done: false }, { reps: 12, weight: 35, done: false }, { reps: 10, weight: 40, done: false } ] },
      { id: "ex15", name: "Elevação de Panturrilha em Pé", youtubeUrl: "", sets: [ { reps: 15, weight: 60, done: false }, { reps: 15, weight: 60, done: false }, { reps: 15, weight: 60, done: false } ] }
    ]
  },
  thu: {
    name: "Quinta: Ombros, Trapézio & Abdômen",
    exercises: [
      { id: "ex16", name: "Desenvolvimento com Halteres", youtubeUrl: "", sets: [ { reps: 10, weight: 18, done: false }, { reps: 10, weight: 18, done: false }, { reps: 8, weight: 20, done: false } ] },
      { id: "ex17", name: "Elevação Lateral com Halteres", youtubeUrl: "", sets: [ { reps: 12, weight: 10, done: false }, { reps: 12, weight: 10, done: false }, { reps: 12, weight: 10, done: false } ] },
      { id: "ex18", name: "Crucifixo Inverso na Máquina / Polia", youtubeUrl: "", sets: [ { reps: 12, weight: 30, done: false }, { reps: 12, weight: 30, done: false }, { reps: 12, weight: 30, done: false } ] },
      { id: "ex19", name: "Encolhimento de Ombros com Halteres", youtubeUrl: "", sets: [ { reps: 15, weight: 26, done: false }, { reps: 15, weight: 26, done: false } ] },
      { id: "ex20", name: "Abdominal Infra / Elevação de Pernas", youtubeUrl: "", sets: [ { reps: 15, weight: 0, done: false }, { reps: 15, weight: 0, done: false } ] }
    ]
  },
  fri: {
    name: "Sexta: Superiores / Braços & Peito Pump",
    exercises: [
      { id: "ex21", name: "Supino Inclinado Máquina", youtubeUrl: "", sets: [ { reps: 10, weight: 50, done: false }, { reps: 10, weight: 50, done: false }, { reps: 10, weight: 50, done: false } ] },
      { id: "ex22", name: "Puxador com Triângulo", youtubeUrl: "", sets: [ { reps: 10, weight: 50, done: false }, { reps: 10, weight: 50, done: false }, { reps: 10, weight: 50, done: false } ] },
      { id: "ex23", name: "Rosca Direta + Tríceps Corda", youtubeUrl: "", sets: [ { reps: 10, weight: 16, done: false }, { reps: 10, weight: 16, done: false } ] },
      { id: "ex24", name: "Prancha Abdominal", youtubeUrl: "", sets: [ { reps: 60, weight: 0, done: false }, { reps: 60, weight: 0, done: false } ] }
    ]
  },
  sat: {
    name: "Sábado: Caminhada / Cardio Moderado",
    exercises: [
      { id: "ex25", name: "Caminhada ou Esteira (min)", youtubeUrl: "", sets: [ { reps: 30, weight: 0, done: false } ] },
      { id: "ex26", name: "Alongamentos e Mobilidade (min)", youtubeUrl: "", sets: [ { reps: 15, weight: 0, done: false } ] }
    ]
  },
  sun: {
    name: "Domingo: Descanso e Recuperação",
    exercises: []
  }
};

const PALETTE_COLORS = [
  '#cbb393', '#dfcfba', '#b8977e', '#89b0ae', '#c07a68', '#a48c6f'
];

function slugifyName(name) {
  return name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/^_+|_+$/g, "") || "usuario";
}

export const Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Erro ao ler ${key}:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Erro ao salvar ${key}:`, e);
      return false;
    }
  },

  // ==========================================
  // GESTÃO DE MÚLTIPLOS PERFIS
  // ==========================================
  getProfiles() {
    return this.get(STORAGE_KEYS.PROFILES_INDEX, []);
  },

  getActiveProfileId() {
    return this.get(STORAGE_KEYS.ACTIVE_PROFILE_ID, null);
  },

  getActiveProfile() {
    const activeId = this.getActiveProfileId();
    const profiles = this.getProfiles();
    return profiles.find(p => p.id === activeId) || null;
  },

  setActiveProfileId(profileId) {
    this.set(STORAGE_KEYS.ACTIVE_PROFILE_ID, profileId);
  },

  loginOrCreateByName(name) {
    const cleanName = name.trim();
    if (!cleanName) return null;

    const slug = slugifyName(cleanName);
    const profiles = this.getProfiles();

    let existing = profiles.find(p => p.id === slug || p.name.toLowerCase() === cleanName.toLowerCase());

    if (existing) {
      this.setActiveProfileId(existing.id);
      return { profile: existing, isNew: false };
    }

    // Cria novo perfil individual
    const colorIndex = profiles.length % PALETTE_COLORS.length;
    const newProfile = {
      id: slug,
      name: cleanName,
      color: PALETTE_COLORS[colorIndex],
      createdAt: new Date().toISOString()
    };

    profiles.push(newProfile);
    this.set(STORAGE_KEYS.PROFILES_INDEX, profiles);
    this.setActiveProfileId(newProfile.id);

    // Perfil inicial pendente de onboarding de estratégia
    this.saveProfile({
      name: cleanName,
      strategy: "basic",
      age: 25,
      height: 175,
      initialWeight: 75.0,
      targetWeight: 70.0,
      targetWeeks: 12,
      dailyCalories: 2200,
      dailyProtein: 150,
      dailyCarbs: 220,
      dailyFat: 60,
      dailyWater: 2500,
      hasCompletedOnboarding: false
    });

    this.saveWorkouts(JSON.parse(JSON.stringify(DEFAULT_WORKOUTS)));

    return { profile: newProfile, isNew: true };
  },

  deleteProfile(profileId) {
    let profiles = this.getProfiles().filter(p => p.id !== profileId);
    this.set(STORAGE_KEYS.PROFILES_INDEX, profiles);

    const keysToRemove = [
      `fit_prof_data_${profileId}`,
      `fit_workouts_${profileId}`,
      `fit_nutrition_${profileId}`,
      `fit_water_${profileId}`,
      `fit_body_${profileId}`
    ];
    keysToRemove.forEach(k => localStorage.removeItem(k));

    if (this.getActiveProfileId() === profileId) {
      const nextProfile = profiles[0] || null;
      this.setActiveProfileId(nextProfile ? nextProfile.id : null);
    }

    return profiles;
  },

  _scopedKey(prefix) {
    const id = this.getActiveProfileId() || 'default_user';
    return `${prefix}_${id}`;
  },

  // ==========================================
  // DADOS ESPECÍFICOS DO PERFIL ATUAL
  // ==========================================
  getProfile() {
    const key = this._scopedKey('fit_prof_data');
    const active = this.getActiveProfile();
    const defaults = { ...DEFAULT_PROFILE_DATA, name: active ? active.name : "Atleta" };
    return this.get(key, defaults);
  },

  saveProfile(profile) {
    const key = this._scopedKey('fit_prof_data');
    const current = this.getProfile();
    return this.set(key, { ...current, ...profile });
  },

  getWorkouts() {
    const key = this._scopedKey('fit_workouts');
    return this.get(key, DEFAULT_WORKOUTS);
  },

  saveWorkouts(workouts) {
    const key = this._scopedKey('fit_workouts');
    return this.set(key, workouts);
  },

  getNutrition(dateStr) {
    const key = this._scopedKey('fit_nutrition');
    const all = this.get(key, {});
    return all[dateStr] || {
      breakfast: [],
      lunch: [],
      snack: [],
      dinner: [],
      supper: []
    };
  },

  saveNutrition(dateStr, meals) {
    const key = this._scopedKey('fit_nutrition');
    const all = this.get(key, {});
    all[dateStr] = meals;
    return this.set(key, all);
  },

  getWater(dateStr) {
    const key = this._scopedKey('fit_water');
    const all = this.get(key, {});
    return all[dateStr] || 0;
  },

  saveWater(dateStr, ml) {
    const key = this._scopedKey('fit_water');
    const all = this.get(key, {});
    all[dateStr] = Math.max(0, ml);
    return this.set(key, all);
  },

  getBodyLogs() {
    const key = this._scopedKey('fit_body');
    const prof = this.getProfile();
    return this.get(key, [
      {
        id: "log_initial",
        date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
        weight: prof.initialWeight || 75.0,
        bodyFat: 20.0,
        muscleMass: 35.0,
        notes: "Início do plano"
      }
    ]);
  },

  saveBodyLogs(logs) {
    const key = this._scopedKey('fit_body');
    return this.set(key, logs);
  },

  getCustomFoods() {
    return this.get(STORAGE_KEYS.CUSTOM_FOODS_GLOBAL, []);
  },

  saveCustomFoods(foods) {
    return this.set(STORAGE_KEYS.CUSTOM_FOODS_GLOBAL, foods);
  },

  /**
   * Calcula estimativa de tempo e ritmo de evolução até a meta
   */
  getGoalProgressionStats() {
    const profile = this.getProfile();
    const bodyLogs = this.getBodyLogs().sort((a, b) => new Date(a.date) - new Date(b.date));

    const initialWeight = profile.initialWeight || (bodyLogs[0] ? bodyLogs[0].weight : 75);
    const targetWeight = profile.targetWeight || 70;
    const currentWeight = bodyLogs.length > 0 ? bodyLogs[bodyLogs.length - 1].weight : initialWeight;

    const isLosing = targetWeight < initialWeight;
    const totalToChange = Math.abs(initialWeight - targetWeight) || 1;
    const currentDiff = Math.abs(currentWeight - initialWeight);
    const remainingToTarget = Math.abs(currentWeight - targetWeight);

    let progressPercent = 0;
    if (isLosing) {
      progressPercent = currentWeight <= targetWeight ? 100 : Math.max(0, Math.min(100, Math.round(((initialWeight - currentWeight) / (initialWeight - targetWeight)) * 100)));
    } else {
      progressPercent = currentWeight >= targetWeight ? 100 : Math.max(0, Math.min(100, Math.round(((currentWeight - initialWeight) / (targetWeight - initialWeight)) * 100)));
    }

    // Calcula taxa com base nos dias reais de registro
    let weeklyRate = 0;
    let estimatedWeeksRemaining = profile.targetWeeks || 12;
    let estimationMode = 'planejado'; // 'real' ou 'planejado'

    if (bodyLogs.length >= 2) {
      const firstDate = new Date(bodyLogs[0].date);
      const lastDate = new Date(bodyLogs[bodyLogs.length - 1].date);
      const diffDays = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
      const weightDelta = Math.abs(bodyLogs[bodyLogs.length - 1].weight - bodyLogs[0].weight);

      if (diffDays >= 3 && weightDelta > 0.1) {
        estimationMode = 'real';
        const ratePerDay = weightDelta / diffDays;
        weeklyRate = Number((ratePerDay * 7).toFixed(2));
        if (ratePerDay > 0) {
          const daysRemaining = remainingToTarget / ratePerDay;
          estimatedWeeksRemaining = Math.max(1, Math.round(daysRemaining / 7));
        }
      }
    }

    // Se ainda não houver histórico suficiente para estimar ritmo real, usa o plano inicial
    if (estimationMode === 'planejado') {
      const plannedWeeks = profile.targetWeeks || 12;
      weeklyRate = Number((totalToChange / plannedWeeks).toFixed(2));
      estimatedWeeksRemaining = plannedWeeks;
    }

    const projectedDate = new Date();
    projectedDate.setDate(projectedDate.getDate() + (estimatedWeeksRemaining * 7));
    const projectedDateFormatted = projectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

    return {
      initialWeight,
      currentWeight,
      targetWeight,
      remainingToTarget: Number(remainingToTarget.toFixed(1)),
      progressPercent,
      weeklyRate,
      estimatedWeeksRemaining,
      estimationMode,
      projectedDateFormatted,
      targetWeeks: profile.targetWeeks || 12
    };
  },

  exportBackup() {
    const profiles = this.getProfiles();
    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      profiles,
      activeProfileId: this.getActiveProfileId(),
      customFoods: this.getCustomFoods(),
      profilesData: {}
    };

    profiles.forEach(p => {
      backup.profilesData[p.id] = {
        profile: this.get(`fit_prof_data_${p.id}`),
        workouts: this.get(`fit_workouts_${p.id}`),
        nutrition: this.get(`fit_nutrition_${p.id}`),
        water: this.get(`fit_water_${p.id}`),
        body: this.get(`fit_body_${p.id}`)
      };
    });

    return JSON.stringify(backup, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profiles && Array.isArray(data.profiles)) {
        this.set(STORAGE_KEYS.PROFILES_INDEX, data.profiles);
        if (data.activeProfileId) this.setActiveProfileId(data.activeProfileId);
        if (data.customFoods) this.saveCustomFoods(data.customFoods);

        if (data.profilesData) {
          Object.keys(data.profilesData).forEach(id => {
            const pData = data.profilesData[id];
            if (pData.profile) this.set(`fit_prof_data_${id}`, pData.profile);
            if (pData.workouts) this.set(`fit_workouts_${id}`, pData.workouts);
            if (pData.nutrition) this.set(`fit_nutrition_${id}`, pData.nutrition);
            if (pData.water) this.set(`fit_water_${id}`, pData.water);
            if (pData.body) this.set(`fit_body_${id}`, pData.body);
          });
        }
        return { success: true };
      }
      return { success: false, error: "Formato de backup inválido" };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
};
