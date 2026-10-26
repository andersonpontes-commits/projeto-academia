import { Storage } from './modules/storage.js';
import { Nutrition } from './modules/nutrition.js';
import { Water } from './modules/water.js';
import { Workouts, getYouTubeEmbedUrl } from './modules/workouts.js';
import { BodyTracker } from './modules/body.js';
import { calculateMacros } from './data/taco_foods.js';

// Estado global da aplicação
const AppState = {
  currentDate: new Date().toISOString().split('T')[0],
  currentWorkoutDay: 'mon',
  selectedFoodForModal: null,
  activeTab: 'tab-dashboard',
  currentExerciseForVideo: null
};

// Determina dia da semana padrão baseado em hoje
function getTodayDayKey() {
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[new Date().getDay()];
}

AppState.currentWorkoutDay = getTodayDayKey();

// Formatação amigável de datas em português
function formatDateDisplay(dateStr) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  if (dateStr === today) return "Hoje";
  if (dateStr === yesterday) return "Ontem";
  if (dateStr === tomorrow) return "Amanhã";

  const parts = dateStr.split('-');
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

// ==========================================
// RENDERIZAÇÃO: DASHBOARD & HOJE
// ==========================================
function renderDashboard() {
  const profile = Storage.getProfile();
  const strategy = profile.strategy || 'basic';
  const dateStr = AppState.currentDate;

  // 1. Apresentação da Estratégia no Card Superior
  const strategyMap = {
    basic: { name: 'Básico', sub: 'Treinos & Peso', badge: 'Nível 1' },
    medium: { name: 'Médio', sub: 'Treinos, Peso & Água', badge: 'Nível 2' },
    advanced: { name: 'Avançado', sub: 'Treinos, Água & Dieta', badge: 'Nível 3' }
  };
  const stratInfo = strategyMap[strategy] || strategyMap.basic;
  const nameEl = document.getElementById('dashStrategyName');
  if (nameEl) nameEl.textContent = stratInfo.name;
  const subEl = document.getElementById('dashStrategySub');
  if (subEl) subEl.textContent = stratInfo.sub;
  const badgeEl = document.getElementById('dashStrategyBadge');
  if (badgeEl) badgeEl.textContent = stratInfo.badge;

  // 2. Visibilidade Condicional com base no Nível de Estratégia
  // Básico: Treino + Peso (oculta Água e Dieta)
  // Médio: Treino + Peso + Água (oculta Dieta)
  // Avançado: Treino + Peso + Água + Dieta (tudo visível)
  const hydrationSection = document.getElementById('cardHydrationSection');
  if (hydrationSection) {
    hydrationSection.style.display = (strategy === 'basic') ? 'none' : 'block';
  }

  const macrosSection = document.getElementById('sectionMacrosDaily');
  if (macrosSection) {
    macrosSection.style.display = (strategy === 'advanced') ? 'block' : 'none';
  }

  const dietNavBtn = document.querySelector('.nav-item[data-tab="tab-nutrition"]');
  if (dietNavBtn) {
    dietNavBtn.style.display = (strategy === 'advanced') ? 'inline-flex' : 'none';
    if (strategy !== 'advanced' && AppState.activeTab === 'tab-nutrition') {
      const dashNav = document.querySelector('.nav-item[data-tab="tab-dashboard"]');
      if (dashNav) dashNav.click();
    }
  }

  // 3. Progresso e Estimativa de Tempo até a Meta de Peso
  const goalStats = Storage.getGoalProgressionStats();
  const curWeightEl = document.getElementById('dashGoalCurrentWeight');
  if (curWeightEl) curWeightEl.textContent = goalStats.currentWeight.toFixed(1);

  const tgtWeightEl = document.getElementById('dashGoalTargetWeight');
  if (tgtWeightEl) tgtWeightEl.textContent = goalStats.targetWeight.toFixed(1);

  const remWeightEl = document.getElementById('dashGoalRemainingWeight');
  if (remWeightEl) remWeightEl.textContent = `${goalStats.remainingToTarget} kg`;

  const rateEl = document.getElementById('dashGoalWeeklyRate');
  if (rateEl) rateEl.textContent = `${goalStats.weeklyRate > 0 ? goalStats.weeklyRate : '--'} kg/sem`;

  const weeksEl = document.getElementById('dashGoalEstimatedWeeks');
  if (weeksEl) weeksEl.textContent = `${goalStats.estimatedWeeksRemaining > 0 ? goalStats.estimatedWeeksRemaining : '--'} semanas`;

  const fillEl = document.getElementById('dashGoalProgressFill');
  if (fillEl) fillEl.style.width = `${goalStats.progressPercent}%`;

  const projEl = document.getElementById('dashGoalProjectionDate');
  if (projEl) {
    if (goalStats.progressPercent >= 100) {
      projEl.textContent = '🎉 Meta Atingida!';
    } else {
      projEl.textContent = `Previsão: ${goalStats.projectedDateFormatted} (~${goalStats.estimatedWeeksRemaining} sem)`;
    }
  }

  // 4. Macros e Nutrição do dia
  const { totals } = Nutrition.getDailyTotals(dateStr);
  const calTarget = profile.dailyCalories || 2200;
  document.getElementById('dashCalories').textContent = totals.calories;
  document.getElementById('dashCaloriesMeta').textContent = `de ${calTarget} kcal`;
  const calPct = Math.min(100, Math.round((totals.calories / calTarget) * 100)) || 0;
  document.getElementById('barCalories').style.width = `${calPct}%`;

  const protTarget = profile.dailyProtein || 160;
  document.getElementById('dashProtein').textContent = `${totals.protein}g`;
  document.getElementById('dashProteinMeta').textContent = `de ${protTarget}g`;
  const protPct = Math.min(100, Math.round((totals.protein / protTarget) * 100)) || 0;
  document.getElementById('barProtein').style.width = `${protPct}%`;

  const carbTarget = profile.dailyCarbs || 230;
  document.getElementById('dashCarbs').textContent = `${totals.carbs}g`;
  document.getElementById('dashCarbsMeta').textContent = `de ${carbTarget}g`;
  const carbPct = Math.min(100, Math.round((totals.carbs / carbTarget) * 100)) || 0;
  document.getElementById('barCarbs').style.width = `${carbPct}%`;

  const fatTarget = profile.dailyFat || 60;
  document.getElementById('dashFat').textContent = `${totals.fat}g`;
  document.getElementById('dashFatMeta').textContent = `de ${fatTarget}g`;
  const fatPct = Math.min(100, Math.round((totals.fat / fatTarget) * 100)) || 0;
  document.getElementById('barFat').style.width = `${fatPct}%`;

  // 5. Treino do dia selecionado (sincronizado com as pílulas da semana)
  const selectedDayWorkout = Workouts.getDayWorkout(AppState.currentWorkoutDay);
  const selectedDays = Workouts.getDays();
  const selectedDayLabel = selectedDays.find(d => d.key === AppState.currentWorkoutDay)?.label || '';
  const isToday = AppState.currentWorkoutDay === getTodayDayKey();

  const heroTagEl = document.querySelector('.hero-tag-pill');
  if (heroTagEl) heroTagEl.textContent = isToday ? 'Treino Programado' : `Treino — ${selectedDayLabel}`;

  document.getElementById('dashTodayWorkoutTitle').textContent = selectedDayWorkout.name;

  const totalSets = (selectedDayWorkout.exercises || []).reduce((acc, ex) => acc + ex.sets.length, 0);
  const doneSets = (selectedDayWorkout.exercises || []).reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);

  const statsEl = document.getElementById('dashWorkoutStats');
  if (statsEl) {
    if (totalSets > 0) {
      statsEl.textContent = `${doneSets}/${totalSets} séries concluídas`;
    } else {
      statsEl.textContent = `${(selectedDayWorkout.exercises || []).length} Exercícios`;
    }
  }

  // 6. Hidratação
  renderWater();
}

function renderWater() {
  const profile = Storage.getProfile();
  const progress = Water.getProgress(AppState.currentDate, profile.dailyWater);

  document.getElementById('dashWaterAmount').textContent = `${progress.current} ml`;
  document.getElementById('dashWaterTarget').textContent = `Meta diária: ${progress.target} ml`;
  document.getElementById('dashWaterPercentage').textContent = `${progress.percentage}%`;
  document.getElementById('waterLevelFill').style.height = `${progress.percentage}%`;
}

// ==========================================
// RENDERIZAÇÃO: DIETA & NUTRIÇÃO
// ==========================================
function renderNutrition() {
  const dateStr = AppState.currentDate;
  const { mealTotals, raw } = Nutrition.getDailyTotals(dateStr);
  const mealsContainer = document.getElementById('mealsContainer');
  if (!mealsContainer) return;

  const mealDefs = [
    { key: 'breakfast', name: 'Café da Manhã', icon: '🌅' },
    { key: 'lunch', name: 'Almoço', icon: '☀️' },
    { key: 'snack', name: 'Café da Tarde / Pré-Treino', icon: '⚡' },
    { key: 'dinner', name: 'Jantar', icon: '🌙' },
    { key: 'supper', name: 'Ceia / Lanche', icon: '🥣' }
  ];

  mealsContainer.innerHTML = mealDefs.map(meal => {
    const items = raw[meal.key] || [];
    const totals = mealTotals[meal.key] || { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const foodRowsHtml = items.length === 0 
      ? `<div style="padding:10px 0; font-size:0.8rem; color:var(--text-subtle);">Nenhum alimento registrado ainda.</div>`
      : items.map(item => `
          <div class="food-row">
            <div class="food-name-qty">
              <strong>${item.name}</strong>
              <span>${item.grams}g • ${item.category || 'Alimento'}</span>
            </div>
            <div class="food-macros-badge">
              <span class="macro-chip cal">${item.calories} kcal</span>
              <span class="macro-chip p">${item.protein}g P</span>
              <span class="macro-chip c">${item.carbs}g C</span>
              <span class="macro-chip g">${item.fat}g G</span>
              <button class="delete-food-btn" data-meal="${meal.key}" data-id="${item.instanceId}" title="Remover">✕</button>
            </div>
          </div>
        `).join('');

    return `
      <div class="meal-block">
        <div class="meal-header">
          <div>
            <span class="meal-name">${meal.icon} ${meal.name}</span>
            <div class="meal-macro-summary">
              ${totals.calories} kcal • ${totals.protein}g Prot • ${totals.carbs}g Carb • ${totals.fat}g Gord
            </div>
          </div>
          <button class="btn-secondary btn-add-meal-food" data-meal="${meal.key}" style="padding:4px 10px; font-size:0.75rem;">
            + Adicionar
          </button>
        </div>
        <div class="meal-food-list">
          ${foodRowsHtml}
        </div>
      </div>
    `;
  }).join('');

  // Listener para excluir alimento
  mealsContainer.querySelectorAll('.delete-food-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const meal = e.currentTarget.dataset.meal;
      const id = e.currentTarget.dataset.id;
      Nutrition.removeFoodFromMeal(AppState.currentDate, meal, id);
      renderNutrition();
      renderDashboard();
    });
  });

  // Listener para abrir modal a partir do botão da refeição
  mealsContainer.querySelectorAll('.btn-add-meal-food').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const meal = e.currentTarget.dataset.meal;
      document.getElementById('foodTargetMealSelect').value = meal;
      openModal('modalAddFood');
    });
  });
}

// ==========================================
// RENDERIZAÇÃO: TREINOS & CRONOGRAMA
// ==========================================
function renderWorkouts() {
  const days = Workouts.getDays();
  const currentKey = AppState.currentWorkoutDay;
  const pillsContainer = document.getElementById('weekDayPills');

  pillsContainer.innerHTML = days.map((d, idx) => `
    <div class="day-pill ${d.key === currentKey ? 'active' : ''}" data-day="${d.key}">
      <span class="short-name">${d.short}</span>
      <span class="day-number">${idx + 1}</span>
    </div>
  `).join('');

  pillsContainer.querySelectorAll('.day-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      AppState.currentWorkoutDay = pill.dataset.day;
      renderWorkouts();
      renderDashboard();
    });
  });

  const workout = Workouts.getDayWorkout(currentKey);
  const nameInput = document.getElementById('workoutNameInput');
  if (nameInput) nameInput.value = workout.name;

  const listContainer = document.getElementById('exercisesListContainer');
  if (!workout.exercises || workout.exercises.length === 0) {
    listContainer.innerHTML = `
      <div style="text-align:center; padding:30px 10px; color:var(--text-muted);">
        <p>Nenhum exercício montado para este dia.</p>
        <p style="font-size:0.8rem; margin-top:4px;">Clique no botão abaixo para adicionar seu primeiro exercício!</p>
      </div>
    `;
    return;
  }

  listContainer.innerHTML = workout.exercises.map(ex => {
    const hasVideo = !!ex.youtubeUrl;
    return `
      <div class="exercise-card" data-ex-id="${ex.id}">
        <div class="exercise-title-row">
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <span class="exercise-name">${ex.name}</span>
            ${hasVideo ? `
              <button class="btn-exercise-video has-video btn-open-video" data-ex-id="${ex.id}" data-ex-name="${ex.name}" data-video-url="${ex.youtubeUrl}" title="Assistir vídeo de execução">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
                Execução
              </button>
            ` : `
              <button class="btn-exercise-video btn-open-video" data-ex-id="${ex.id}" data-ex-name="${ex.name}" data-video-url="" title="Adicionar link do YouTube da execução">
                + Vídeo
              </button>
            `}
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-secondary btn-add-set" data-ex-id="${ex.id}" style="padding:4px 8px; font-size:0.75rem;" title="Adicionar Série">+ Série</button>
            <button class="icon-btn btn-remove-ex" data-ex-id="${ex.id}" style="width:28px; height:28px; font-size:0.75rem;" title="Remover Exercício">✕</button>
          </div>
        </div>
        <table class="sets-table">
          <thead>
            <tr>
              <th>SÉRIE</th>
              <th>CARGA (KG)</th>
              <th>REPS</th>
              <th>OK</th>
            </tr>
          </thead>
          <tbody>
            ${ex.sets.map((set, sIdx) => `
              <tr>
                <td style="font-size:0.85rem; font-weight:700; color:var(--text-muted);">${sIdx + 1}</td>
                <td>
                  <input type="number" step="0.5" class="set-input set-weight" data-ex-id="${ex.id}" data-set-idx="${sIdx}" value="${set.weight}">
                </td>
                <td>
                  <input type="number" class="set-input set-reps" data-ex-id="${ex.id}" data-set-idx="${sIdx}" value="${set.reps}">
                </td>
                <td>
                  <button class="set-check-btn ${set.done ? 'done' : ''}" data-ex-id="${ex.id}" data-set-idx="${sIdx}" title="Concluir série">
                    ${set.done ? '✓' : '○'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  // Listener para abrir modal de vídeo do YouTube
  listContainer.querySelectorAll('.btn-open-video').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exId = e.currentTarget.dataset.exId;
      const exName = e.currentTarget.dataset.exName;
      const videoUrl = e.currentTarget.dataset.videoUrl || '';

      AppState.currentExerciseForVideo = {
        day: currentKey,
        exId,
        name: exName,
        url: videoUrl
      };

      document.getElementById('videoModalExerciseTitle').textContent = `${exName} — Execução`;
      document.getElementById('inputEditExerciseVideoUrl').value = videoUrl;

      const embedContainer = document.getElementById('videoEmbedContainer');
      const embedUrl = getYouTubeEmbedUrl(videoUrl);

      if (embedUrl) {
        embedContainer.innerHTML = `
          <iframe 
            src="${embedUrl}?autoplay=1" 
            title="${exName}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        `;
      } else {
        embedContainer.innerHTML = `
          <div style="padding:40px 20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom:8px; opacity:0.6;">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            <p style="font-weight:600; color:#fff; margin-bottom:4px;">Nenhum vídeo cadastrado</p>
            <p style="font-size:0.75rem;">Cole o link do YouTube da execução correta no campo abaixo para fixar neste exercício.</p>
          </div>
        `;
      }

      openModal('modalExerciseVideo');
    });
  });

  // Listeners dos sets
  listContainer.querySelectorAll('.set-check-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exId = e.currentTarget.dataset.exId;
      const sIdx = Number(e.currentTarget.dataset.setIdx);
      Workouts.toggleSetDone(currentKey, exId, sIdx);
      renderWorkouts();
      renderDashboard();
    });
  });

  listContainer.querySelectorAll('.set-weight').forEach(input => {
    input.addEventListener('change', (e) => {
      const exId = e.currentTarget.dataset.exId;
      const sIdx = Number(e.currentTarget.dataset.setIdx);
      Workouts.updateSet(currentKey, exId, sIdx, 'weight', Number(e.currentTarget.value) || 0);
    });
  });

  listContainer.querySelectorAll('.set-reps').forEach(input => {
    input.addEventListener('change', (e) => {
      const exId = e.currentTarget.dataset.exId;
      const sIdx = Number(e.currentTarget.dataset.setIdx);
      Workouts.updateSet(currentKey, exId, sIdx, 'reps', Number(e.currentTarget.value) || 0);
    });
  });

  listContainer.querySelectorAll('.btn-add-set').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const exId = e.currentTarget.dataset.exId;
      Workouts.addSetToExercise(currentKey, exId);
      renderWorkouts();
    });
  });

  listContainer.querySelectorAll('.btn-remove-ex').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (confirm("Deseja realmente remover este exercício?")) {
        const exId = e.currentTarget.dataset.exId;
        Workouts.removeExercise(currentKey, exId);
        renderWorkouts();
        renderDashboard();
      }
    });
  });
}

// ==========================================
// RENDERIZAÇÃO: EVOLUÇÃO & BIOIMPEDÂNCIA
// ==========================================
function renderEvolution() {
  const stats = BodyTracker.getStats();
  const logs = BodyTracker.getLogs();

  document.getElementById('bioCurrentWeight').textContent = stats.hasData ? `${stats.currentWeight} kg` : '-- kg';
  document.getElementById('bioCurrentBf').textContent = stats.currentBf ? `${stats.currentBf}%` : '-- %';
  document.getElementById('bioCurrentMuscle').textContent = stats.currentMuscle ? `${stats.currentMuscle}%` : '-- %';

  const chartContainer = document.getElementById('bioChartContainer');
  chartContainer.innerHTML = BodyTracker.renderSvgChart(logs, 'weight');

  const historyContainer = document.getElementById('bioHistoryList');
  if (logs.length === 0) {
    historyContainer.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center; padding:16px;">Nenhuma pesagem cadastrada.</p>`;
    return;
  }

  // Inverte para exibir mais recentes primeiro
  const reversed = [...logs].reverse();
  historyContainer.innerHTML = reversed.map(log => {
    const parts = log.date.split('-');
    const dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
    return `
      <div class="food-row" style="padding:10px 0;">
        <div>
          <strong style="color:#fff; font-size:0.95rem;">${log.weight} kg</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">
            ${dateFormatted} ${log.bodyFat ? '• ' + log.bodyFat + '% BF' : ''} ${log.muscleMass ? '• ' + log.muscleMass + '% M.Magra' : ''}
          </div>
          ${log.notes ? `<div style="font-size:0.72rem; color:var(--text-subtle);">${log.notes}</div>` : ''}
        </div>
        <button class="delete-food-btn btn-delete-bio" data-id="${log.id}" title="Excluir medição">✕</button>
      </div>
    `;
  }).join('');

  historyContainer.querySelectorAll('.btn-delete-bio').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm("Excluir esta pesagem do histórico?")) {
        BodyTracker.deleteLog(id);
        renderEvolution();
        renderDashboard();
      }
    });
  });
}

// ==========================================
// RENDERIZAÇÃO: AJUSTES & CONFIGURAÇÃO
// ==========================================
function renderSettings() {
  const profile = Storage.getProfile();
  document.getElementById('profName').value = profile.name || "";
  document.getElementById('profHeight').value = profile.height || 175;
  document.getElementById('profTargetWeight').value = profile.targetWeight || 75;
  document.getElementById('profCalories').value = profile.dailyCalories || 2200;
  document.getElementById('profProtein').value = profile.dailyProtein || 160;
  document.getElementById('profCarbs').value = profile.dailyCarbs || 230;
  document.getElementById('profFat').value = profile.dailyFat || 60;
  document.getElementById('profWater').value = profile.dailyWater || 3000;

}

// ==========================================
// MODAIS & CONTROLADORES
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('open');
    // Para vídeos do YouTube ao fechar modal
    if (modalId === 'modalExerciseVideo') {
      const container = document.getElementById('videoEmbedContainer');
      if (container) container.innerHTML = '';
    }
  }
}

function prefillOnboardingModal(profile) {
  const currentStrat = profile.strategy || 'basic';
  const hiddenInput = document.getElementById('selectedStrategyValue');
  if (hiddenInput) hiddenInput.value = currentStrat;

  document.querySelectorAll('.strategy-card-item').forEach(c => {
    c.classList.toggle('selected', c.dataset.strategy === currentStrat);
  });

  const ageEl = document.getElementById('onboardingAge');
  if (ageEl) ageEl.value = profile.age || 28;

  const heightEl = document.getElementById('onboardingHeight');
  if (heightEl) heightEl.value = profile.height || 175;

  const stats = BodyTracker.getStats();
  const curWeight = stats.hasData ? stats.currentWeight : (profile.initialWeight || 75);
  const curWeightEl = document.getElementById('onboardingCurrentWeight');
  if (curWeightEl) curWeightEl.value = curWeight;

  const targetEl = document.getElementById('onboardingTargetWeight');
  if (targetEl) targetEl.value = profile.targetWeight || 70;

  const weeksEl = document.getElementById('onboardingTargetWeeks');
  if (weeksEl) weeksEl.value = profile.targetWeeks || 12;
}

function setupModals() {
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      closeModal(btn.dataset.modal);
    });
  });

  // Modal Alimento
  const btnOpenAddFood = document.getElementById('btnOpenAddFoodModal');
  if (btnOpenAddFood) {
    btnOpenAddFood.addEventListener('click', () => {
      openModal('modalAddFood');
    });
  }

  const searchInput = document.getElementById('foodSearchInput');
  const resultsContainer = document.getElementById('foodSearchResults');
  const portionInput = document.getElementById('foodPortionInput');

  function renderSearchResults(items) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = items.map(item => `
      <div class="search-item" data-id="${item.id}">
        <div class="search-item-info">
          <strong>${item.name}</strong>
          <span>${item.calories} kcal • P:${item.protein}g • C:${item.carbs}g • G:${item.fat}g (por 100g)</span>
        </div>
      </div>
    `).join('');

    resultsContainer.querySelectorAll('.search-item').forEach(el => {
      el.addEventListener('click', () => {
        resultsContainer.querySelectorAll('.search-item').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');
        const selectedId = el.dataset.id;
        const all = Nutrition.getFoodDatabase();
        AppState.selectedFoodForModal = all.find(f => f.id === selectedId) || null;
        updateFoodPreview();
      });
    });
  }

  function updateFoodPreview() {
    const previewBox = document.getElementById('foodPreviewMacros');
    if (!previewBox) return;
    if (!AppState.selectedFoodForModal) {
      previewBox.style.display = 'none';
      return;
    }
    const grams = Number(portionInput.value) || 100;
    const computed = calculateMacros(AppState.selectedFoodForModal, grams);
    document.getElementById('prevKcal').textContent = `${computed.calories} kcal`;
    document.getElementById('prevProt').textContent = `${computed.protein}g Prot`;
    document.getElementById('prevCarb').textContent = `${computed.carbs}g Carb`;
    document.getElementById('prevFat').textContent = `${computed.fat}g Gord`;
    previewBox.style.display = 'block';
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value;
      const local = Nutrition.searchLocalFoods(q);
      renderSearchResults(local);
    });
  }

  if (portionInput) {
    portionInput.addEventListener('input', updateFoodPreview);
  }

  renderSearchResults(Nutrition.searchLocalFoods(''));

  const btnConfirmAddFood = document.getElementById('btnConfirmAddFood');
  if (btnConfirmAddFood) {
    btnConfirmAddFood.addEventListener('click', () => {
      if (!AppState.selectedFoodForModal) {
        alert("Selecione um alimento da lista acima.");
        return;
      }
      const meal = document.getElementById('foodTargetMealSelect').value;
      const grams = Number(portionInput.value) || 100;
      Nutrition.addFoodToMeal(AppState.currentDate, meal, AppState.selectedFoodForModal, grams);

      closeModal('modalAddFood');
      renderNutrition();
      renderDashboard();
    });
  }

  // Modal Bioimpedância
  const btnOpenBio = document.getElementById('btnOpenAddBioModal');
  if (btnOpenBio) {
    btnOpenBio.addEventListener('click', () => {
      document.getElementById('bioDate').value = AppState.currentDate;
      openModal('modalAddBio');
    });
  }

  const bioForm = document.getElementById('bioForm');
  if (bioForm) {
    bioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      BodyTracker.addLog({
        date: document.getElementById('bioDate').value,
        weight: document.getElementById('bioWeight').value,
        bodyFat: document.getElementById('bioBf').value,
        muscleMass: document.getElementById('bioMuscle').value,
        notes: document.getElementById('bioNotes').value
      });
      closeModal('modalAddBio');
      renderEvolution();
      renderDashboard();
    });
  }

  // Modal Exercício
  const btnOpenEx = document.getElementById('btnOpenAddExerciseModal');
  if (btnOpenEx) {
    btnOpenEx.addEventListener('click', () => {
      openModal('modalAddExercise');
    });
  }

  const exerciseForm = document.getElementById('exerciseForm');
  if (exerciseForm) {
    exerciseForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('exName').value;
      const sets = Number(document.getElementById('exSets').value) || 3;
      const reps = Number(document.getElementById('exReps').value) || 10;
      const weight = Number(document.getElementById('exWeight').value) || 0;
      const youtubeUrl = document.getElementById('exYoutubeUrl').value || '';

      Workouts.addExercise(AppState.currentWorkoutDay, name, sets, reps, weight, youtubeUrl);
      
      // Limpa campos
      document.getElementById('exName').value = '';
      document.getElementById('exYoutubeUrl').value = '';
      
      closeModal('modalAddExercise');
      renderWorkouts();
      renderDashboard();
    });
  }

  // Modal Vídeo do Exercício: Salvar Link
  const btnSaveVideo = document.getElementById('btnSaveExerciseVideoUrl');
  if (btnSaveVideo) {
    btnSaveVideo.addEventListener('click', () => {
      if (!AppState.currentExerciseForVideo) return;
      const newUrl = document.getElementById('inputEditExerciseVideoUrl').value.trim();
      Workouts.updateExerciseVideo(AppState.currentExerciseForVideo.day, AppState.currentExerciseForVideo.exId, newUrl);
      AppState.currentExerciseForVideo.url = newUrl;

      const embedContainer = document.getElementById('videoEmbedContainer');
      const embedUrl = getYouTubeEmbedUrl(newUrl);

      if (embedUrl) {
        embedContainer.innerHTML = `
          <iframe 
            src="${embedUrl}?autoplay=1" 
            title="Execução" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen>
          </iframe>
        `;
      } else if (newUrl) {
        embedContainer.innerHTML = `
          <div style="padding:40px 20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
            Link salvo com sucesso!
          </div>
        `;
      } else {
        embedContainer.innerHTML = `
          <div style="padding:40px 20px; text-align:center; color:var(--text-muted); font-size:0.85rem;">
            Vídeo removido.
          </div>
        `;
      }

      renderWorkouts();
    });
  }

  // Configuração das Opções de Estratégia no Modal de Onboarding
  document.querySelectorAll('.strategy-card-item').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.strategy-card-item').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const hidden = document.getElementById('selectedStrategyValue');
      if (hidden) hidden.value = card.dataset.strategy;
    });
  });

  // Submissão do Formulário de Onboarding & Estratégia
  const onboardingForm = document.getElementById('onboardingStrategyForm');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const strategy = document.getElementById('selectedStrategyValue').value || 'basic';
      const age = Number(document.getElementById('onboardingAge').value) || 28;
      const height = Number(document.getElementById('onboardingHeight').value) || 175;
      const currentWeight = Number(document.getElementById('onboardingCurrentWeight').value) || 75;
      const targetWeight = Number(document.getElementById('onboardingTargetWeight').value) || 70;
      const targetWeeks = Number(document.getElementById('onboardingTargetWeeks').value) || 12;

      // Se não houver pesagem cadastrada no histórico, insere a pesagem inicial informada
      const logs = BodyTracker.getLogs();
      if (logs.length === 0) {
        BodyTracker.addLog({
          date: AppState.currentDate,
          weight: currentWeight,
          bodyFat: null,
          muscleMass: null,
          notes: "Início do plano de treino"
        });
      }

      Storage.saveProfile({
        strategy,
        age,
        height,
        initialWeight: currentWeight,
        targetWeight,
        targetWeeks,
        hasCompletedOnboarding: true
      });

      closeModal('modalOnboardingStrategy');
      renderAllViews();
    });
  }
}

// ==========================================
// EVENTOS PRINCIPAIS E INICIALIZAÇÃO
// ==========================================
function init() {
  // Navegação de abas inferiores
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.dataset.tab;
      document.getElementById(targetTab).classList.add('active');
      AppState.activeTab = targetTab;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Atalho do hero card para ir direto para aba de treinos
  const btnHeroGo = document.getElementById('btnGoToWorkoutTab');
  if (btnHeroGo) {
    btnHeroGo.addEventListener('click', () => {
      const tabBtn = document.querySelector('.nav-item[data-tab="tab-workouts"]');
      if (tabBtn) tabBtn.click();
    });
  }

  // Atalho do hero side card para alterar estratégia / metas
  const btnStrategySide = document.getElementById('btnOpenStrategyModal');
  if (btnStrategySide) {
    btnStrategySide.addEventListener('click', () => {
      prefillOnboardingModal(Storage.getProfile());
      openModal('modalOnboardingStrategy');
    });
  }

  // Atalho do ícone de ajustes no cabeçalho
  const btnSettings = document.getElementById('btnSettingsHeader');
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      const tabBtn = document.querySelector('.nav-item[data-tab="tab-settings"]');
      if (tabBtn) tabBtn.click();
    });
  }

  // Data Global
  document.getElementById('currentDateDisplay').textContent = formatDateDisplay(AppState.currentDate);

  document.getElementById('btnPrevDay').addEventListener('click', () => {
    const d = new Date(AppState.currentDate);
    d.setDate(d.getDate() - 1);
    AppState.currentDate = d.toISOString().split('T')[0];
    document.getElementById('currentDateDisplay').textContent = formatDateDisplay(AppState.currentDate);
    renderDashboard();
    renderNutrition();
  });

  document.getElementById('btnNextDay').addEventListener('click', () => {
    const d = new Date(AppState.currentDate);
    d.setDate(d.getDate() + 1);
    AppState.currentDate = d.toISOString().split('T')[0];
    document.getElementById('currentDateDisplay').textContent = formatDateDisplay(AppState.currentDate);
    renderDashboard();
    renderNutrition();
  });

  // Botões de água rápida
  document.querySelectorAll('.btn-water').forEach(btn => {
    btn.addEventListener('click', () => {
      const ml = Number(btn.dataset.ml);
      Water.addAmount(AppState.currentDate, ml);
      renderWater();
    });
  });

  // Salvar título do treino ao alterar
  const workoutNameInput = document.getElementById('workoutNameInput');
  if (workoutNameInput) {
    workoutNameInput.addEventListener('change', (e) => {
      Workouts.updateDayWorkoutInfo(AppState.currentWorkoutDay, e.target.value);
      renderDashboard();
    });
  }

  const btnResetSets = document.getElementById('btnResetDaySets');
  if (btnResetSets) {
    btnResetSets.addEventListener('click', () => {
      if (confirm("Zerar as marcações de séries deste treino para começar novamente?")) {
        Workouts.resetAllSets(AppState.currentWorkoutDay);
        renderWorkouts();
        renderDashboard();
      }
    });
  }

  // Formulário de perfil / metas
  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      Storage.saveProfile({
        name: document.getElementById('profName').value,
        height: Number(document.getElementById('profHeight').value),
        targetWeight: Number(document.getElementById('profTargetWeight').value),
        dailyCalories: Number(document.getElementById('profCalories').value),
        dailyProtein: Number(document.getElementById('profProtein').value),
        dailyCarbs: Number(document.getElementById('profCarbs').value),
        dailyFat: Number(document.getElementById('profFat').value),
        dailyWater: Number(document.getElementById('profWater').value)
      });
      alert("Metas atualizadas com sucesso!");
      renderDashboard();
    });
  }

  // Gerenciamento de Perfis e Onboarding
  setupProfileManager();

  // Inicializa componentes
  setupModals();

  renderAllViews();

  // Se o perfil ativo ainda não concluiu onboarding, abre o modal de estratégia
  const activeProfile = Storage.getActiveProfile();
  if (activeProfile && !activeProfile.hasCompletedOnboarding) {
    prefillOnboardingModal(activeProfile);
    openModal('modalOnboardingStrategy');
  }
}

function renderAllViews() {
  renderHeaderProfile();
  renderDashboard();
  renderNutrition();
  renderWorkouts();
  renderEvolution();
  renderSettings();
}

// ==========================================
// GESTÃO DE MÚLTIPLOS PERFIS (LOGIN / CADASTRO POR NOME)
// ==========================================
function setupProfileManager() {
  const modalLogin = document.getElementById('modalProfileLogin');
  const btnHeader = document.getElementById('btnHeaderProfile');
  const loginForm = document.getElementById('profileLoginForm');
  const inputName = document.getElementById('inputProfileLoginName');

  // Abre modal de perfil ao clicar no botão do cabeçalho
  if (btnHeader) {
    btnHeader.addEventListener('click', () => {
      renderProfilesChips();
      inputName.value = "";
      modalLogin.classList.add('open');
      inputName.focus();
    });
  }

  // Submissão do login/cadastro por nome
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = inputName.value.trim();
      if (!name) return;

      const profile = Storage.loginOrCreateByName(name);
      if (profile) {
        modalLogin.classList.remove('open');
        renderAllViews();

        // Se perfil é novo ou não concluiu a estratégia de acompanhamento
        if (!profile.hasCompletedOnboarding) {
          prefillOnboardingModal(profile);
          openModal('modalOnboardingStrategy');
        }
      }
    });
  }

  // Se não houver perfil ativo, abre automaticamente o login
  const active = Storage.getActiveProfile();
  if (!active) {
    const all = Storage.getProfiles();
    if (all.length > 0) {
      Storage.setActiveProfileId(all[0].id);
      renderAllViews();
    } else {
      renderProfilesChips();
      modalLogin.classList.add('open');
    }
  }
}

function renderHeaderProfile() {
  const active = Storage.getActiveProfile();
  const avatarEl = document.getElementById('headerProfileAvatar');
  const nameEl = document.getElementById('headerProfileName');

  if (!avatarEl || !nameEl) return;

  if (active) {
    const initial = active.name.trim().charAt(0).toUpperCase() || 'A';
    avatarEl.textContent = initial;
    avatarEl.style.backgroundColor = active.color || 'var(--accent-sand)';
    avatarEl.style.color = '#121212';
    nameEl.textContent = active.name;
  } else {
    avatarEl.textContent = '+';
    avatarEl.style.backgroundColor = 'var(--bg-surface)';
    avatarEl.style.color = '#fff';
    nameEl.textContent = 'Entrar';
  }
}

function renderProfilesChips() {
  const container = document.getElementById('profilesChipsContainer');
  if (!container) return;
  const profiles = Storage.getProfiles();
  const activeId = Storage.getActiveProfileId();

  if (profiles.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-subtle);">Nenhum perfil criado ainda. Digite seu nome abaixo para começar!</p>`;
    return;
  }

  container.innerHTML = profiles.map(p => {
    const initial = p.name.trim().charAt(0).toUpperCase() || 'U';
    const isActive = p.id === activeId;
    return `
      <div class="profile-chip-item ${isActive ? 'active' : ''}" data-id="${p.id}" style="${isActive ? 'border-color:var(--accent-sand);' : ''}">
        <div class="profile-chip-avatar" style="background:${p.color || 'var(--accent-sand)'}; color:#121212; font-weight:700;">
          ${initial}
        </div>
        <div class="profile-chip-name">${p.name}</div>
        ${profiles.length > 1 ? `<button class="delete-profile-btn" data-delete-id="${p.id}" title="Excluir perfil">✕</button>` : ''}
      </div>
    `;
  }).join('');

  // Clique no chip para trocar de perfil
  container.querySelectorAll('.profile-chip-item').forEach(chip => {
    chip.addEventListener('click', (e) => {
      if (e.target.classList.contains('delete-profile-btn')) return;

      const id = chip.dataset.id;
      Storage.setActiveProfileId(id);
      document.getElementById('modalProfileLogin').classList.remove('open');
      renderAllViews();

      const current = Storage.getActiveProfile();
      if (current && !current.hasCompletedOnboarding) {
        prefillOnboardingModal(current);
        openModal('modalOnboardingStrategy');
      }
    });
  });

  // Excluir perfil
  container.querySelectorAll('.delete-profile-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.deleteId;
      const target = profiles.find(p => p.id === id);
      if (confirm(`Deseja realmente excluir o perfil "${target ? target.name : id}" e todos os seus treinos?`)) {
        Storage.deleteProfile(id);
        renderProfilesChips();
        renderAllViews();
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
