import {
  Button,
  Card,
  IconButton,
  Modal,
  PaperProvider,
  Portal,
  Provider,
  Text,
  TextInput,
} from 'react-native-paper';
import { DateTime } from 'luxon';
import { Meal } from '../hooks/useChat';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
  onRender?: () => void;
  onEdit?: (meal: Meal) => void;
};

const MealCard = ({ meal, onSave, onRender, onEdit }: MealCardProps) => {
  const [editMode, setEditMode] = useState(false);
  useEffect(() => onRender?.(), []);
  return (
    <>
      <Provider>
        <Portal>
          <Modal
            visible={editMode}
            onDismiss={() => setEditMode(false)}
            contentContainerStyle={{
              backgroundColor: 'white',
              padding: 20,
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'center',
            }}
          >
            <Card>
              <Card.Content>
                <Text>This is a modal</Text>
              </Card.Content>
            </Card>
          </Modal>
        </Portal>
      </Provider>
      <View style={styles.mainContainer}>
        <View>
          <View style={styles.titleRow}>
            <Text variant="headlineSmall">{meal.title}</Text>
            {!!onEdit && (
              <IconButton
                icon={() => (
                  <MaterialIcons name="edit" size={24} color="black" />
                )}
                onPress={() => setEditMode(true)}
              />
            )}
          </View>
          <Text style={{ fontSize: 50 }}>😄</Text>
          {meal.date && (
            <Text>
              Date:
              {DateTime.fromFormat(meal.date, 'yyyy-MM-dd').toLocaleString(
                DateTime.DATE_MED
              )}
            </Text>
          )}
          <Text>Calories: {meal.breakdown.calories}</Text>
          <Text>Carbs: {meal.breakdown.carbs}g</Text>
          <Text>Fat: {meal.breakdown.fat}g</Text>
          <Text>Protein: {meal.breakdown.protein}g</Text>
        </View>
        <Button mode="outlined" onPress={() => onSave?.(meal)} disabled={!meal}>
          Save as Meal
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '20rem',
    height: '20rem',
    margin: '1rem',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editModal: {
    backgroundColor: 'white',
  },
});

export default MealCard;
