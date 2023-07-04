import { Button, Text } from 'react-native-paper';
import { Meal } from '../hooks/useChat';
import { View } from 'react-native';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
};

const MealCard = ({ meal, onSave }: MealCardProps) => {
  return (
    <>
      <View>
        <Text variant="displayMedium">{meal.title}</Text>
        <Text>Calories: {meal.breakdown.calories}</Text>
        <Text>Carbs: {meal.breakdown.carbs}</Text>
        <Text>Fat: {meal.breakdown.fat}</Text>
        <Text>Protein: {meal.breakdown.protein}</Text>
      </View>
      <Button mode="outlined" onPress={() => onSave?.(meal)} disabled={!meal}>
        Save as Meal
      </Button>
    </>
  );
};

export default MealCard;
