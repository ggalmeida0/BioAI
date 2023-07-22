import { Button, Text } from 'react-native-paper';
import { DateTime } from 'luxon';
import { Meal } from '../hooks/useChat';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
  onRender?: () => void;
};

const MealCard = ({ meal, onSave, onRender }: MealCardProps) => {
  useEffect(() => onRender?.(), []);
  return (
    <View style={styles.mainContainer}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '20rem',
    height: '20rem',
    marginRight: '2rem',
    marginLeft: '2rem',
  },
});

export default MealCard;
