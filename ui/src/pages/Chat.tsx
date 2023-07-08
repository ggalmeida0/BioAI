import React, { useEffect, useMemo, useState, useRef } from 'react';
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
  const [errorOccurred, setErrorOccurred] = useState<boolean>(false);

  const {
    messagesContext: { data: savedChatMessages, isError: getChatError },
    senderContext: {
      mutate: sendChat,
      isLoading: sendingChat,
      isError: sendChatError,
    },
  } = useChat({
    onSendSuccess: (data: Message) =>
      setChat((prevChat) => [...prevChat, data]),
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
      setChat((prevChat) => [...prevChat, newChat]);
    },
  });

  useEffect(() => {
    if (savedChatMessages) {
      const messages = savedChatMessages
        .map((chatMessage) => chatMessage.messages)
        .flat();
      setChat(messages);
    }
  }, [savedChatMessages]);

  useEffect(() => {
    if (
      getChatError ||
      sendChatError ||
      saveMealError ||
      getFrequentMealsError
    ) {
      setChat((prevChat) => [
        ...prevChat,
        {
          content:
            'Something went wrong while I was talking to the server. You can try asking me again or in a different way.',
          role: Assistant,
          isLoading: false,
        },
      ]);
      setErrorOccurred(true);
    }
  }, [getChatError, sendChatError, saveMealError, getFrequentMealsError]);

  const handleSend = () => {
    const newMessage: Message = { content: input, role: User };
    setChat((prevChat) => [...prevChat, newMessage]);
    setInput('');
    sendChat(input);
  };

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
        visible={errorOccurred}
        onDismiss={() => setErrorOccurred(false)}
      >
        Error occurred
      </Snackbar>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {chat.map((message, index) => {
            if (message.role === User) {
              return (
                <View key={index}>
                  {sendingChat ? (
                    <ActivityIndicator />
                  ) : (
                    <ChatBubble role={message.role} message={message} />
                  )}
                </View>
              );
            } else if (
              message.role === Assistant &&
              message.meal === undefined
            ) {
              return (
                <View key={index}>
                  {sendingChat ? (
                    <ActivityIndicator />
                  ) : (
                    <ChatBubble role={message.role} message={message} />
                  )}
                </View>
              );
            } else if (message.role === Assistant && message.meal) {
              return (
                <View key={index}>
                  <ChatBubble role={message.role} message={message} />
                  <MealCard
                    meal={message.meal}
                    onSave={(meal: Meal) => saveMeal(meal)}
                  />
                </View>
              );
            } else {
              return null;
            }
          })}
        </ScrollView>
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
            />
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
  chatContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
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
  },
});

export default Chat;
