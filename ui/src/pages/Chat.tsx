import { Button, IconButton, TextInput } from 'react-native-paper';
import { StyleSheet, Modal, View } from 'react-native';
import useChat, { Meal, Message } from '../hooks/useChat';
import { useEffect, useMemo, useState } from 'react';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import ChatBubble from '../components/ChatBubble';
import useMeals from '../hooks/useMeals';
import MealCard from '../components/MealCard';
import SkeletonContent from 'react-native-skeleton-content';

const User = 'user';
const Assistant = 'assistant';

const Chat = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Message[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const {
    messagesContext: { data: savedChatMessages },
    senderContext: { mutate: sendChat, isLoading: sendingChat },
  } = useChat({
    onSendSuccess: (data: Message) => setChat([...chat, data]),
  });

  const {
    saveMealMutation: { mutate: saveMeal },
    getFrequentMealsQuery: {
      data: frequentMeals,
      isLoading: isLoadingFrequentMeals,
    },
  } = useMeals({ enableGetFrequentMeals: modalVisible });

  useEffect(() => {
    if (savedChatMessages) {
      setChat(savedChatMessages[savedChatMessages.length - 1].messages);
    }
  }, [savedChatMessages]);

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
        {isLoadingFrequentMeals
          ? Array.from({ length: 5 }).map((_, index) => (
              <SkeletonContent
                key={`skeleton-${index}`}
                containerStyle={{ flex: 1, width: '100%' }}
                isLoading={true}
                layout={[
                  { key: 'card', width: '95%', height: 100, margin: 20 },
                ]}
              >
                <View style={{ width: 220, height: 20 }} />
              </SkeletonContent>
            ))
          : frequentMeals?.map((meal) => (
              <MealCard
                key={meal.title}
                meal={meal}
                onSave={(meal: Meal) => saveMeal(meal)}
              />
            ))}
      </Modal>
      <View style={styles.container}>
        <ChatBubble
          role={User}
          message={userLastMessage}
          isLoading={input.length > 0}
        />
        <ChatBubble
          role={Assistant}
          message={bioLastMessage}
          isLoading={sendingChat}
        />
        {bioLastMessage.meal && (
          <MealCard
            meal={bioLastMessage.meal}
            onSave={(meal: Meal) => saveMeal(meal)}
          />
        )}
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TextInput
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
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
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
  },
});

export default Chat;
