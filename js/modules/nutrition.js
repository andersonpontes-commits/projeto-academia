import { TACO_FOODS, calculateMacros } from '../data/taco_foods.js';
import { Storage } from './storage.js';

export const Nutrition = {
  getFoodDatabase() {
    const custom = Storage.getCustomFoods();
    return [...custom, ...TACO_FOODS];
  },

  searchLocalFoods(query) {
    if (!query || query.trim().length === 0) {
      return this.getFoodDatabase().slice(0, 20);
    }
    const clean = query.toLowerCase().trim();
    return this.getFoodDatabase().filter(f => 
      f.name.toLowerCase().includes(clean) || 
      (f.category && f.category.toLowerCase().includes(clean))
    );
  },

  // Busca complementar online no Open Food Facts Brasil caso o usuário queira buscar produto industrializado específico
  async searchOnlineFoods(query) {
    if (!query || query.length < 3) return [];
    try {
      const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&cc=br`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!data.products) return [];

      return data.products
        .filter(p => p.product_name && p.nutriments)
        .map(p => {
          const n = p.nutriments;
          const calories = Math.round(n['energy-kcal_100g'] || (n['energy_100g'] ? n['energy_100g'] / 4.184 : 0));
          const protein = Number((n['proteins_100g'] || 0).toFixed(1));
          const carbs = Number((n['carbohydrates_100g'] || 0).toFixed(1));
          const fat = Number((n['fat_100g'] || 0).toFixed(1));
          const fiber = Number((n['fiber_100g'] || 0).toFixed(1));

          return {
            id: `off_${p.code || Math.random().toString(36).substring(7)}`,
            name: `${p.product_name} ${p.brands ? '(' + p.brands + ')' : ''}`,
            category: "OpenFoodFacts",
            serving: 100,
            unit: "g",
            calories,
            protein,
            carbs,
            fat,
            fiber
          };
        });
    } catch (e) {
      console.warn("Busca online não disponível (modo offline ativo):", e);
      return [];
    }
  },

  addCustomFood(food) {
    const custom = Storage.getCustomFoods();
    const newFood = {
      id: `custom_${Date.now()}`,
      name: food.name,
      category: food.category || "Personalizado",
      serving: 100,
      unit: "g",
      calories: Number(food.calories) || 0,
      protein: Number(food.protein) || 0,
      carbs: Number(food.carbs) || 0,
      fat: Number(food.fat) || 0,
      fiber: Number(food.fiber) || 0
    };
    custom.unshift(newFood);
    Storage.saveCustomFoods(custom);
    return newFood;
  },

  addFoodToMeal(dateStr, mealKey, food, grams) {
    const nutrition = Storage.getNutrition(dateStr);
    if (!nutrition[mealKey]) nutrition[mealKey] = [];

    const computed = calculateMacros(food, grams);

    nutrition[mealKey].push({
      instanceId: `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      foodId: food.id,
      name: food.name,
      category: food.category,
      grams: Number(grams),
      ...computed
    });

    Storage.saveNutrition(dateStr, nutrition);
    return nutrition;
  },

  removeFoodFromMeal(dateStr, mealKey, instanceId) {
    const nutrition = Storage.getNutrition(dateStr);
    if (nutrition[mealKey]) {
      nutrition[mealKey] = nutrition[mealKey].filter(item => item.instanceId !== instanceId);
      Storage.saveNutrition(dateStr, nutrition);
    }
    return nutrition;
  },

  getDailyTotals(dateStr) {
    const nutrition = Storage.getNutrition(dateStr);
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const mealTotals = {};

    Object.keys(nutrition).forEach(mealKey => {
      const items = nutrition[mealKey] || [];
      mealTotals[mealKey] = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      items.forEach(item => {
        totals.calories += item.calories || 0;
        totals.protein += item.protein || 0;
        totals.carbs += item.carbs || 0;
        totals.fat += item.fat || 0;
        totals.fiber += item.fiber || 0;

        mealTotals[mealKey].calories += item.calories || 0;
        mealTotals[mealKey].protein += item.protein || 0;
        mealTotals[mealKey].carbs += item.carbs || 0;
        mealTotals[mealKey].fat += item.fat || 0;
        mealTotals[mealKey].fiber += item.fiber || 0;
      });
      mealTotals[mealKey].protein = Number(mealTotals[mealKey].protein.toFixed(1));
      mealTotals[mealKey].carbs = Number(mealTotals[mealKey].carbs.toFixed(1));
      mealTotals[mealKey].fat = Number(mealTotals[mealKey].fat.toFixed(1));
      mealTotals[mealKey].fiber = Number(mealTotals[mealKey].fiber.toFixed(1));
    });

    totals.protein = Number(totals.protein.toFixed(1));
    totals.carbs = Number(totals.carbs.toFixed(1));
    totals.fat = Number(totals.fat.toFixed(1));
    totals.fiber = Number(totals.fiber.toFixed(1));

    return { totals, mealTotals, raw: nutrition };
  }
};
