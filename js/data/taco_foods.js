/**
 * Base de Alimentos calibrada segundo a TACO (Tabela Brasileira de Composição de Alimentos - UNICAMP)
 * e TBCA (Tabela Brasileira de Composição de Alimentos - USP).
 * Valores expressos por porção padrão de 100g (ou 100ml).
 */
export const TACO_FOODS = [
  // CEREAIS, LEGUMINOSAS E TUBÉRCULOS
  {
    id: "arroz_branco",
    name: "Arroz Branco Cozido",
    category: "Grãos e Tubérculos",
    serving: 100,
    unit: "g",
    calories: 128,
    protein: 2.5,
    carbs: 28.1,
    fat: 0.2,
    fiber: 1.6
  },
  {
    id: "arroz_integral",
    name: "Arroz Integral Cozido",
    category: "Grãos e Tubérculos",
    serving: 100,
    unit: "g",
    calories: 124,
    protein: 2.6,
    carbs: 25.8,
    fat: 1.0,
    fiber: 2.7
  },
  {
    id: "feijao_carioca",
    name: "Feijão Carioca Cozido (grão + caldo)",
    category: "Leguminosas",
    serving: 100,
    unit: "g",
    calories: 76,
    protein: 4.8,
    carbs: 13.6,
    fat: 0.5,
    fiber: 8.5
  },
  {
    id: "feijao_preto",
    name: "Feijão Preto Cozido (grão + caldo)",
    category: "Leguminosas",
    serving: 100,
    unit: "g",
    calories: 77,
    protein: 4.5,
    carbs: 14.0,
    fat: 0.5,
    fiber: 8.4
  },
  {
    id: "lentilha",
    name: "Lentilha Cozida",
    category: "Leguminosas",
    serving: 100,
    unit: "g",
    calories: 93,
    protein: 6.3,
    carbs: 16.3,
    fat: 0.5,
    fiber: 7.9
  },
  {
    id: "grao_de_bico",
    name: "Grão-de-bico Cozido",
    category: "Leguminosas",
    serving: 100,
    unit: "g",
    calories: 139,
    protein: 7.2,
    carbs: 23.4,
    fat: 2.1,
    fiber: 7.6
  },
  {
    id: "aveia_flocos",
    name: "Aveia em Flocos",
    category: "Cereais",
    serving: 100,
    unit: "g",
    calories: 394,
    protein: 13.9,
    carbs: 66.6,
    fat: 8.5,
    fiber: 9.1
  },
  {
    id: "batata_doce",
    name: "Batata-Doce Cozida",
    category: "Grãos e Tubérculos",
    serving: 100,
    unit: "g",
    calories: 77,
    protein: 0.6,
    carbs: 18.4,
    fat: 0.1,
    fiber: 2.2
  },
  {
    id: "batata_inglesa",
    name: "Batata Inglesa Cozida",
    category: "Grãos e Tubérculos",
    serving: 100,
    unit: "g",
    calories: 52,
    protein: 1.2,
    carbs: 11.9,
    fat: 0.1,
    fiber: 1.3
  },
  {
    id: "mandioca",
    name: "Mandioca / Aipim Cozido",
    category: "Grãos e Tubérculos",
    serving: 100,
    unit: "g",
    calories: 125,
    protein: 0.6,
    carbs: 30.1,
    fat: 0.3,
    fiber: 1.6
  },
  {
    id: "macarrao_cozido",
    name: "Macarrão Tradicional Cozido",
    category: "Cereais",
    serving: 100,
    unit: "g",
    calories: 141,
    protein: 4.5,
    carbs: 29.2,
    fat: 0.6,
    fiber: 1.5
  },
  {
    id: "cuscuz_milho",
    name: "Cuscuz Nordestino Cozido",
    category: "Cereais",
    serving: 100,
    unit: "g",
    calories: 113,
    protein: 2.2,
    carbs: 25.1,
    fat: 0.7,
    fiber: 1.8
  },
  {
    id: "tapioca_goma",
    name: "Goma de Tapioca Pronta",
    category: "Cereais",
    serving: 100,
    unit: "g",
    calories: 240,
    protein: 0.2,
    carbs: 60.0,
    fat: 0.1,
    fiber: 0.5
  },
  {
    id: "pao_frances",
    name: "Pão Francês Tradicional (1 unid ~50g)",
    category: "Pães",
    serving: 100,
    unit: "g",
    calories: 300,
    protein: 8.0,
    carbs: 58.7,
    fat: 3.1,
    fiber: 2.3
  },
  {
    id: "pao_integral",
    name: "Pão de Forma 100% Integral",
    category: "Pães",
    serving: 100,
    unit: "g",
    calories: 235,
    protein: 10.5,
    carbs: 43.0,
    fat: 2.8,
    fiber: 6.9
  },

  // PROTEÍNAS ANIMAIS E VEGETAIS
  {
    id: "frango_peito_grelhado",
    name: "Peito de Frango Grelhado",
    category: "Proteínas",
    serving: 100,
    unit: "g",
    calories: 159,
    protein: 32.0,
    carbs: 0.0,
    fat: 2.5,
    fiber: 0.0
  },
  {
    id: "frango_sobrecoxa",
    name: "Sobrecoxa de Frango Sem Pele Assada",
    category: "Proteínas",
    serving: 100,
    unit: "g",
    calories: 167,
    protein: 24.5,
    carbs: 0.0,
    fat: 7.2,
    fiber: 0.0
  },
  {
    id: "carne_patinho",
    name: "Carne Bovina Patinho Moído Grelhado",
    category: "Proteínas",
    serving: 100,
    unit: "g",
    calories: 219,
    protein: 35.9,
    carbs: 0.0,
    fat: 7.3,
    fiber: 0.0
  },
  {
    id: "carne_alcatra",
    name: "Carne Bovina Alcatra Grelhada (sem gordura)",
    category: "Proteínas",
    serving: 100,
    unit: "g",
    calories: 241,
    protein: 31.9,
    carbs: 0.0,
    fat: 11.6,
    fiber: 0.0
  },
  {
    id: "carne_acem",
    name: "Carne Moída de Acém Cozida",
    category: "Proteínas",
    serving: 100,
    unit: "g",
    calories: 212,
    protein: 26.7,
    carbs: 0.0,
    fat: 10.9,
    fiber: 0.0
  },
  {
    id: "ovo_cozido",
    name: "Ovo de Galinha Inteiro Cozido (1 unid ~50g)",
    category: "Ovos",
    serving: 100,
    unit: "g",
    calories: 146,
    protein: 13.3,
    carbs: 0.6,
    fat: 9.5,
    fiber: 0.0
  },
  {
    id: "ovo_clara",
    name: "Clara de Ovo Cozida",
    category: "Ovos",
    serving: 100,
    unit: "g",
    calories: 52,
    protein: 11.0,
    carbs: 0.7,
    fat: 0.2,
    fiber: 0.0
  },
  {
    id: "ovo_frito",
    name: "Ovo de Galinha Frito com pouco óleo",
    category: "Ovos",
    serving: 100,
    unit: "g",
    calories: 240,
    protein: 15.6,
    carbs: 1.2,
    fat: 18.6,
    fiber: 0.0
  },
  {
    id: "tilapia_grelhada",
    name: "Filé de Tilápia Grelhado",
    category: "Peixes",
    serving: 100,
    unit: "g",
    calories: 128,
    protein: 26.1,
    carbs: 0.0,
    fat: 2.7,
    fiber: 0.0
  },
  {
    id: "salmao_grelhado",
    name: "Salmão Grelhado",
    category: "Peixes",
    serving: 100,
    unit: "g",
    calories: 229,
    protein: 24.2,
    carbs: 0.0,
    fat: 14.0,
    fiber: 0.0
  },
  {
    id: "atum_agua",
    name: "Atum em Lata Conserva em Água",
    category: "Peixes",
    serving: 100,
    unit: "g",
    calories: 116,
    protein: 25.5,
    carbs: 0.0,
    fat: 0.8,
    fiber: 0.0
  },

  // LATICÍNIOS
  {
    id: "leite_desnatado",
    name: "Leite de Vaca Desnatado",
    category: "Laticínios",
    serving: 100,
    unit: "ml",
    calories: 35,
    protein: 3.1,
    carbs: 4.9,
    fat: 0.1,
    fiber: 0.0
  },
  {
    id: "leite_integral",
    name: "Leite de Vaca Integral",
    category: "Laticínios",
    serving: 100,
    unit: "ml",
    calories: 61,
    protein: 3.0,
    carbs: 4.8,
    fat: 3.2,
    fiber: 0.0
  },
  {
    id: "queijo_minas",
    name: "Queijo Minas Frescal",
    category: "Laticínios",
    serving: 100,
    unit: "g",
    calories: 227,
    protein: 17.4,
    carbs: 3.2,
    fat: 16.0,
    fiber: 0.0
  },
  {
    id: "queijo_mussarela",
    name: "Queijo Muçarela",
    category: "Laticínios",
    serving: 100,
    unit: "g",
    calories: 310,
    protein: 23.0,
    carbs: 2.5,
    fat: 23.1,
    fiber: 0.0
  },
  {
    id: "queijo_cottage",
    name: "Queijo Cottage",
    category: "Laticínios",
    serving: 100,
    unit: "g",
    calories: 98,
    protein: 12.0,
    carbs: 3.4,
    fat: 4.3,
    fiber: 0.0
  },
  {
    id: "iogurte_natural_desnatado",
    name: "Iogurte Natural Desnatado",
    category: "Laticínios",
    serving: 100,
    unit: "g",
    calories: 43,
    protein: 4.0,
    carbs: 5.8,
    fat: 0.4,
    fiber: 0.0
  },
  {
    id: "requeijao_light",
    name: "Requeijão Cremoso Light",
    category: "Laticínios",
    serving: 100,
    unit: "g",
    calories: 160,
    protein: 9.8,
    carbs: 4.0,
    fat: 11.2,
    fiber: 0.0
  },

  // SUPLEMENTOS
  {
    id: "whey_concentrado",
    name: "Whey Protein Concentrado 80%",
    category: "Suplementos",
    serving: 100,
    unit: "g",
    calories: 400,
    protein: 80.0,
    carbs: 8.0,
    fat: 6.0,
    fiber: 0.0
  },
  {
    id: "whey_isolado",
    name: "Whey Protein Isolado 90%",
    category: "Suplementos",
    serving: 100,
    unit: "g",
    calories: 370,
    protein: 90.0,
    carbs: 1.5,
    fat: 1.0,
    fiber: 0.0
  },
  {
    id: "creatina",
    name: "Creatina Monohidratada Pura",
    category: "Suplementos",
    serving: 100,
    unit: "g",
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    fiber: 0.0
  },
  {
    id: "pasta_amendoim",
    name: "Pasta de Amendoim Integral 100%",
    category: "Gorduras e Oleaginosas",
    serving: 100,
    unit: "g",
    calories: 590,
    protein: 26.0,
    carbs: 18.0,
    fat: 49.0,
    fiber: 8.0
  },
  {
    id: "azeite_oliva",
    name: "Azeite de Oliva Extra Virgem",
    category: "Gorduras e Oleaginosas",
    serving: 100,
    unit: "ml",
    calories: 884,
    protein: 0.0,
    carbs: 0.0,
    fat: 100.0,
    fiber: 0.0
  },
  {
    id: "castanha_para",
    name: "Castanha-do-Pará / Brasil",
    category: "Gorduras e Oleaginosas",
    serving: 100,
    unit: "g",
    calories: 656,
    protein: 14.3,
    carbs: 12.3,
    fat: 66.4,
    fiber: 7.5
  },

  // FRUTAS
  {
    id: "banana_prata",
    name: "Banana Prata Crua",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 89,
    protein: 1.3,
    carbs: 26.0,
    fat: 0.1,
    fiber: 2.0
  },
  {
    id: "maca",
    name: "Maçã Fuji / Gala com Casca",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 56,
    protein: 0.3,
    carbs: 15.2,
    fat: 0.2,
    fiber: 1.3
  },
  {
    id: "mamao_papaia",
    name: "Mamão Papaia",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 40,
    protein: 0.5,
    carbs: 10.4,
    fat: 0.1,
    fiber: 1.8
  },
  {
    id: "morango",
    name: "Morango Fresco",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 30,
    protein: 0.9,
    carbs: 6.8,
    fat: 0.3,
    fiber: 1.7
  },
  {
    id: "abacate",
    name: "Abacate",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    fiber: 6.7
  },
  {
    id: "laranja",
    name: "Laranja Pera Fresca",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 47,
    protein: 1.0,
    carbs: 11.8,
    fat: 0.1,
    fiber: 2.4
  },
  {
    id: "melancia",
    name: "Melancia Fresca",
    category: "Frutas",
    serving: 100,
    unit: "g",
    calories: 33,
    protein: 0.9,
    carbs: 8.1,
    fat: 0.0,
    fiber: 0.1
  },

  // VEGETAIS E VERDURAS
  {
    id: "brocolis",
    name: "Brócolis Cozido",
    category: "Vegetais",
    serving: 100,
    unit: "g",
    calories: 25,
    protein: 2.1,
    carbs: 4.4,
    fat: 0.5,
    fiber: 3.4
  },
  {
    id: "cenoura",
    name: "Cenoura Crua",
    category: "Vegetais",
    serving: 100,
    unit: "g",
    calories: 34,
    protein: 1.3,
    carbs: 7.7,
    fat: 0.2,
    fiber: 3.2
  },
  {
    id: "tomate",
    name: "Tomate Comum Cru",
    category: "Vegetais",
    serving: 100,
    unit: "g",
    calories: 15,
    protein: 1.1,
    carbs: 3.1,
    fat: 0.2,
    fiber: 1.2
  },
  {
    id: "alface",
    name: "Alface Crespa Crua",
    category: "Vegetais",
    serving: 100,
    unit: "g",
    calories: 11,
    protein: 1.3,
    carbs: 1.7,
    fat: 0.2,
    fiber: 1.3
  }
];

/**
 * Calcula macros de uma quantidade em gramas/ml baseada em 100g de referência
 */
export function calculateMacros(food, weightInGrams) {
  const factor = weightInGrams / 100;
  return {
    calories: Math.round(food.calories * factor),
    protein: Number((food.protein * factor).toFixed(1)),
    carbs: Number((food.carbs * factor).toFixed(1)),
    fat: Number((food.fat * factor).toFixed(1)),
    fiber: Number(((food.fiber || 0) * factor).toFixed(1))
  };
}
