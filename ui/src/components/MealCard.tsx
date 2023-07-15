import { Button, Text } from 'react-native-paper';
import { DateTime } from 'luxon';
import { Meal } from '../hooks/useChat';
import { View } from 'react-native';
import { useEffect } from 'react';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
  onRender?: () => void;
};

const MealCard = ({ meal, onSave, onRender }: MealCardProps) => {
  useEffect(() => onRender?.(), [meal]);
  useEffect(() => {
    setTimeout(() => onRender?.(), 500);
  }, []);
  return (
    <>
      <View>
        <Text variant="displayMedium">{meal.title}</Text>
        {meal.date && (
          <Text>
            Date:
            {DateTime.fromFormat(meal.date, 'yyyy-MM-dd').toLocaleString(
              DateTime.DATE_MED
            )}
          </Text>
        )}
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
