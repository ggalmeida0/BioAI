import React, { useEffect, useState, useRef } from 'react';
import {
  ActivityIndicator,
  Button,
  IconButton,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import { StyleSheet, Modal, View, ScrollView, Dimensions } from 'react-native';
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
  const scrollViewRef = useRef<ScrollView>(null);

  const {
    messagesContext: { data: savedChatMessages, isLoading: gettingChat },
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
    if (sendChatError || saveMealError) {
      setChat((prevChat) => [
        ...prevChat,
        {
          content:
            'Something went wrong while I was talking to the server. You can try asking me again or in a different way.',
          role: Assistant,
        },
      ]);
      setErrorOccurred(true);
    }
  }, [sendChatError, saveMealError]);

  useEffect(() => scrollToEnd(), [savingMeal]);

  function scrollToEnd() {
    scrollViewRef.current?.scrollToEnd({ animated: false });
  }

  const handleSend = () => {
    const newMessage: Message = { content: input, role: User };
    setChat((prevChat) => [...prevChat, newMessage]);
    setInput('');
    sendChat(input);
  };

  const handleSaveMeal = (meal: Meal) => {
    setModalVisible(false);
    saveMeal(meal);
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
          <View style={styles.modalContainer}>
            {isLoadingFrequentMeals ? (
              <View style={styles.centerLoadingContainer}>
                <ActivityIndicator />
              </View>
            ) : (
              frequentMeals?.map((meal) => (
                <MealCard
                  key={meal.title}
                  meal={meal}
                  onSave={handleSaveMeal}
                />
              ))
            )}
          </View>
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
        <ScrollView
          style={styles.scrollViewColor}
          contentContainerStyle={styles.scrollView}
          ref={scrollViewRef}
        >
          {chat.length === 0 && gettingChat && <ActivityIndicator />}
          {chat.map((message, index) => (
            <View key={index} style={styles.chatContainer}>
              {!message.meal && (
                <ChatBubble
                  role={message.role}
                  message={message}
                  onContentChange={scrollToEnd}
                  isAnimated={index === chat.length - 1}
                />
              )}
              {message.meal && (
                <MealCard
                  meal={message.meal}
                  onSave={(meal: Meal) => saveMeal(meal)}
                  onRender={scrollToEnd}
                  onEdit={(updatedMeal: Meal) =>
                    setChat(
                      chat.map((message, i) =>
                        i === index
                          ? { ...message, meal: updatedMeal }
                          : message
                      )
                    )
                  }
                />
              )}
            </View>
          ))}
          {(sendingChat || savingMeal) && (
            <View style={styles.centerLoadingContainer}>
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
        <View style={styles.fixedView} />
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
const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignSelf: 'center',
    padding: 5,
  },
  scrollViewColor: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  container: {
    backgroundColor: '#C8B6FF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    height: height,
    width: width,
  },
  chatContainer: {
    width: '100%',
  },
  inputContainer: {
    gap: 3,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: Platform.OS === 'ios' ? '100%' : undefined,
  },
  fixedView: {
    position: 'absolute',
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
    width: '20%',
    height: '20%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: Platform.OS === 'ios' ? '80%' : undefined,
    backgroundColor: '#ECDFF5',
  },
  modalContainer: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default Chat;
