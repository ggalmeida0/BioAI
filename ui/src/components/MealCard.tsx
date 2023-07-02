import { Button } from 'react-native-paper';
import { Meal } from '../hooks/useChat';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
};

const MealCard = ({ meal, onSave }: MealCardProps) => {
  return (
    <>
      <div
        style={{
          border: '1px solid black',
          margin: '10px',
          padding: '10px',
          borderRadius: '5px',
        }}
      >
        <h2>{meal.title}</h2>
        <p>Calories: {meal.breakdown.calories}</p>
        <p>Carbs: {meal.breakdown.carbs}</p>
        <p>Fat: {meal.breakdown.fat}</p>
        <p>Protein: {meal.breakdown.protein}</p>
      </div>
      <Button mode="outlined" onPress={() => onSave?.(meal)} disabled={!meal}>
        Save as Meal
      </Button>
    </>
  );
};

export default MealCard;
