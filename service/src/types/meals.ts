import { MathExpression } from 'mathjs';

export type Meal = {
  title: string;
  breakdown: NutritionBreakdown;
  date?: string;
  emoji: string;
};

type NutritionBreakdown = {
  calories: number | MathExpression;
  carbs: number | MathExpression;
  fat: number | MathExpression;
  protein: number | MathExpression;
  portion: string;
};
