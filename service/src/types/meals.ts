export type Meal = {
  title: string;
  breakdown: NutritionBreakdown;
};

type NutritionBreakdown = {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
};
