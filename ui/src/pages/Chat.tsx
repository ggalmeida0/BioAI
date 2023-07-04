import {
  ActivityIndicator,
  Button,
  IconButton,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { StyleSheet, Modal, View, ScrollView } from 'react-native';
import useChat, { Meal, Message } from '../hooks/useChat';
import { useEffect, useMemo, useState } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import ChatBubble from '../components/ChatBubble';
import useMeals from '../hooks/useMeals';
import MealCard from '../components/MealCard';
import { Platform } from 'react-native';

const User = 'user';
const Assistant = 'assistant';

const Chat = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [snackbarVisible, setSnackbarVisible] = useState<boolean>(false);
  const [errorOcurred, setErrorSnackbar] = useState<boolean>(false);

  const {
    messagesContext: { data: savedChatMessages, isError: getChatError },
    senderContext: {
      mutate: sendChat,
      isLoading: sendingChat,
      isError: sendChatError,
    },
  } = useChat({
    onSendSuccess: (data: Message) => setChat([...chat, data]),
  });

  const {
    saveMealMutation: {
      mutate: saveMeal,
      isLoading: savingMeal,
      isError: saveMealError,
    },
    getFrequentMealsQuery: {
      data: frequentMeals,
      isLoading: isLoadingFrequentMeals,
      isError: getFrequentMealsError,
    },
  } = useMeals({
    enableGetFrequentMeals: modalVisible,
    onSaveSuccess: (newChat: Message) => {
      setSnackbarVisible(true);
      setChat([...chat, newChat]);
    },
  });

  useEffect(() => {
    if (savedChatMessages) {
      setChat(savedChatMessages[savedChatMessages.length - 1].messages);
    }
  }, [savedChatMessages]);

  useEffect(() => {
    if (
      getChatError ||
      sendChatError ||
      saveMealError ||
      getFrequentMealsError
    ) {
      setChat([
        ...chat,
        {
          content:
            'Something went wrong while I was talking to the server. You can try asking me again or in a different way.',
          role: Assistant,
        },
      ]);
      setErrorSnackbar(true);
    }
  }, [getChatError, sendChatError, saveMealError, getFrequentMealsError]);

  const handleSend = () => {
    setChat([...chat, { content: input, role: User }]);
    setInput('');
    sendChat(input);
  };

  const bioLastMessage = useMemo(
    () =>
      chat.reduce<Message>(
        (acc, curr) => (curr.role === Assistant ? curr : acc),
        {
          content: '',
          role: Assistant,
        }
      ),
    [chat]
  );

  const userLastMessage = useMemo(
    () =>
      chat.reduce<Message>((acc, curr) => (curr.role === User ? curr : acc), {
        content: '',
        role: User,
      }),
    [chat]
  );

  return (
    <>
      <Modal
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalHeader}>
          <IconButton
            icon={() => (
              <AntDesign name="closecircle" size={24} color="black" />
            )}
            onPress={() => setModalVisible(false)}
          />
        </View>
        <ScrollView>
          {isLoadingFrequentMeals ? (
            <View style={styles.centerLoadingContainer}>
              <ActivityIndicator />
            </View>
          ) : (
            frequentMeals?.map((meal) => (
              <MealCard
                key={meal.title}
                meal={meal}
                onSave={(meal: Meal) => saveMeal(meal)}
              />
            ))
          )}
        </ScrollView>
      </Modal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
      >
        Meal saved!
      </Snackbar>
      <Snackbar
        visible={errorOcurred}
        onDismiss={() => setErrorSnackbar(false)}
      >
        Error ocurred
      </Snackbar>
      <View style={styles.container}>
        <ChatBubble
          role={User}
          message={userLastMessage}
          isLoading={input.length > 0}
        />
        <ChatBubble
          role={Assistant}
          message={bioLastMessage}
          isLoading={sendingChat || savingMeal}
        />
        {!sendingChat && bioLastMessage.meal && !savingMeal && (
          <MealCard
            meal={bioLastMessage.meal}
            onSave={(meal: Meal) => saveMeal(meal)}
          />
        )}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
            style={styles.input}
              value={input}
              mode="outlined"
              onChangeText={setInput}
              onKeyPress={(event: any) => {
                if (event.key === 'Enter') {
                  handleSend();
                }
              }}
            ></TextInput>
            <IconButton
              mode="outlined"
              icon={() => (
                <MaterialIcons name="history" size={24} color="black" />
              )}
              onPress={() => setModalVisible(true)}
            />
          </View>
          <Button mode="outlined" onPress={handleSend} style={styles.button}>
            Send
          </Button>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 10,
  },
  inputContainer: {
    gap: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.OS === 'ios' ? '100%' : undefined,
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: Platform.OS === 'ios' ? '100%' : undefined,
  },
  button: {
    width: '100%',
    marginBottom: 10,
  },
  modalHeader: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  centerLoadingContainer: {
    display: 'flex',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: { 
    width: Platform.OS === 'ios' ? '80%' : undefined,
  }
});

export default Chat;
