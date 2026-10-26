import { Storage } from './storage.js';

export const Water = {
  getTodayAmount(dateStr) {
    return Storage.getWater(dateStr);
  },

  addAmount(dateStr, ml) {
    const current = Storage.getWater(dateStr);
    const updated = Math.max(0, current + ml);
    Storage.saveWater(dateStr, updated);
    return updated;
  },

  setAmount(dateStr, ml) {
    const updated = Math.max(0, Number(ml) || 0);
    Storage.saveWater(dateStr, updated);
    return updated;
  },

  reset(dateStr) {
    Storage.saveWater(dateStr, 0);
    return 0;
  },

  getProgress(dateStr, targetMl) {
    const current = this.getTodayAmount(dateStr);
    const target = targetMl || Storage.getProfile().dailyWater || 3000;
    const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    return {
      current,
      target,
      percentage,
      remaining: Math.max(0, target - current)
    };
  }
};
