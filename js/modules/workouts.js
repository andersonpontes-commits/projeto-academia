import { Storage } from './storage.js';

/**
 * Converte qualquer formato de URL do YouTube em formato de embed seguro
 */
export function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const clean = url.trim();

  // Caso: youtu.be/ID
  const matchShort = clean.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (matchShort) return `https://www.youtube.com/embed/${matchShort[1]}`;

  // Caso: watch?v=ID
  const matchWatch = clean.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (matchWatch) return `https://www.youtube.com/embed/${matchWatch[1]}`;

  // Caso: /shorts/ID
  const matchShorts = clean.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
  if (matchShorts) return `https://www.youtube.com/embed/${matchShorts[1]}`;

  // Caso: já é /embed/ID
  const matchEmbed = clean.match(/\/embed\/([a-zA-Z0-9_-]+)/);
  if (matchEmbed) return clean;

  // Caso: passou apenas o código de 11 caracteres
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
    return `https://www.youtube.com/embed/${clean}`;
  }

  return clean.startsWith('http') ? clean : null;
}

export const Workouts = {
  getDays() {
    return [
      { key: 'mon', label: 'Segunda', short: 'SEG' },
      { key: 'tue', label: 'Terça', short: 'TER' },
      { key: 'wed', label: 'Quarta', short: 'QUA' },
      { key: 'thu', label: 'Quinta', short: 'QUI' },
      { key: 'fri', label: 'Sexta', short: 'SEX' },
      { key: 'sat', label: 'Sábado', short: 'SÁB' },
      { key: 'sun', label: 'Domingo', short: 'DOM' }
    ];
  },

  getAll() {
    return Storage.getWorkouts();
  },

  getDayWorkout(dayKey) {
    const all = Storage.getWorkouts();
    return all[dayKey] || { name: "Dia Livre / Descanso", exercises: [] };
  },

  updateDayWorkoutInfo(dayKey, name) {
    const all = Storage.getWorkouts();
    if (!all[dayKey]) all[dayKey] = { exercises: [] };
    all[dayKey].name = name;
    Storage.saveWorkouts(all);
    return all[dayKey];
  },

  addExercise(dayKey, exerciseName, setsCount = 3, defaultReps = 10, defaultWeight = 0, youtubeUrl = "") {
    const all = Storage.getWorkouts();
    if (!all[dayKey]) all[dayKey] = { name: "Treino", exercises: [] };

    const sets = [];
    for (let i = 0; i < setsCount; i++) {
      sets.push({
        reps: Number(defaultReps) || 10,
        weight: Number(defaultWeight) || 0,
        done: false
      });
    }

    const newEx = {
      id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: exerciseName.trim(),
      youtubeUrl: (youtubeUrl || '').trim(),
      sets
    };

    all[dayKey].exercises.push(newEx);
    Storage.saveWorkouts(all);
    return newEx;
  },

  updateExerciseVideo(dayKey, exerciseId, youtubeUrl) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    ex.youtubeUrl = (youtubeUrl || '').trim();
    Storage.saveWorkouts(all);
    return ex;
  },

  removeExercise(dayKey, exerciseId) {
    const all = Storage.getWorkouts();
    if (all[dayKey]) {
      all[dayKey].exercises = all[dayKey].exercises.filter(e => e.id !== exerciseId);
      Storage.saveWorkouts(all);
    }
    return all[dayKey];
  },

  updateSet(dayKey, exerciseId, setIndex, field, value) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (!ex || !ex.sets[setIndex]) return;

    ex.sets[setIndex][field] = value;
    Storage.saveWorkouts(all);
    return ex.sets[setIndex];
  },

  toggleSetDone(dayKey, exerciseId, setIndex) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (!ex || !ex.sets[setIndex]) return;

    const newState = !ex.sets[setIndex].done;
    ex.sets[setIndex].done = newState;
    Storage.saveWorkouts(all);

    return { done: newState };
  },

  addSetToExercise(dayKey, exerciseId) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (!ex) return;

    const lastSet = ex.sets[ex.sets.length - 1];
    ex.sets.push({
      reps: lastSet ? lastSet.reps : 10,
      weight: lastSet ? lastSet.weight : 0,
      done: false
    });

    Storage.saveWorkouts(all);
    return ex;
  },

  removeSetFromExercise(dayKey, exerciseId, setIndex) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    const ex = workout.exercises.find(e => e.id === exerciseId);
    if (!ex || ex.sets.length <= 1) return;

    ex.sets.splice(setIndex, 1);
    Storage.saveWorkouts(all);
    return ex;
  },

  resetAllSets(dayKey) {
    const all = Storage.getWorkouts();
    const workout = all[dayKey];
    if (!workout) return;

    workout.exercises.forEach(ex => {
      ex.sets.forEach(s => s.done = false);
    });

    Storage.saveWorkouts(all);
    return workout;
  }
};
