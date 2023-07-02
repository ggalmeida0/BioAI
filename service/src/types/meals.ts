import { MathExpression } from 'mathjs';

export type Meal = {
  title: string;
  breakdown: NutritionBreakdown;
};

type NutritionBreakdown = {
  calories: number | MathExpression;
  carbs: number | MathExpression;
  fat: number | MathExpression;
  protein: number | MathExpression;
};
