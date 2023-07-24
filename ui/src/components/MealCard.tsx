import {
  Button,
  Card,
  IconButton,
  Modal,
  Portal,
  Provider,
  Text,
  TextInput,
} from 'react-native-paper';
import { DateTime } from 'luxon';
import { Meal } from '../hooks/useChat';
import { StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';

type MealCardProps = {
  meal: Meal;
  onSave?: (meal: Meal) => void;
  onRender?: () => void;
  onEdit?: (meal: Meal) => void;
};

const MealCard = ({ meal, onSave, onRender, onEdit }: MealCardProps) => {
  const [editMode, setEditMode] = useState(false);
  const [editModel, setEditModel] = useState(meal);
  useEffect(() => onRender?.(), []);
  return (
    <>
      {editMode && (
        <Provider>
          <Portal>
            <Modal
              visible={editMode}
              onDismiss={() => setEditMode(false)}
              contentContainerStyle={styles.editModal}
            >
              <Card>
                <View style={styles.modalHeader}>
                  <IconButton
                    icon={() => (
                      <AntDesign name="closecircle" size={24} color="black" />
                    )}
                    onPress={() => setEditMode(false)}
                  />
                </View>
                <Card.Content>
                  <TextInput
                    label="Title"
                    value={editModel.title}
                    onChangeText={(text) =>
                      setEditModel({ ...editModel, title: text })
                    }
                  />
                  <Button
                    onPress={() => {
                      onEdit?.(editModel);
                      setEditMode(false);
                    }}
                    style={styles.saveButton}
                  >
                    Apply Changes
                  </Button>
                </Card.Content>
              </Card>
            </Modal>
          </Portal>
        </Provider>
      )}
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
          <View style={styles.bodyContainer}>
            <Text style={{ fontSize: 50 }}>{meal.emoji}</Text>
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
        </View>
        <Button
          mode="outlined"
          onPress={() => onSave?.(meal)}
          disabled={!meal}
          style={styles.saveButton}
        >
          Save as Meal
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: '15rem',
    margin: '1rem',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    zIndex: -1,
    alignItems: 'center',
  },
  titleRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editModal: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
  },
  saveButton: { marginTop: 10 },
  bodyContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
});

export default MealCard;
