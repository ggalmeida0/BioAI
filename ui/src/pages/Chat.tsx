import { Button, IconButton, Text, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import useChat, { Meal, Message } from '../hooks/useChat';
import { useEffect, useMemo, useState } from 'react';
import { AntDesign } from '@expo/vector-icons';
import ChatBubble from '../components/ChatBubble';
import useMeals from '../hooks/useMeals';

const User = 'user';
const Assistant = 'assistant';

// Styling sucks, but it's just a placeholder
const MealCard = ({
  meal,
  onSave,
}: {
  meal: Meal;
  onSave: (meal: Meal) => void;
}) => {
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
      <IconButton
        icon={() => <AntDesign name="save" size={24} color="black" />}
        onPress={() => onSave(meal)}
        disabled={!meal}
      />
    </>
  );
};

const Chat = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Message[]>([]);

  const {
    messagesContext: { data: savedChatMessages },
    senderContext: { mutate: sendChat, isLoading: sendingChat },
  } = useChat({
    onSendSuccess: (data: Message) => setChat([...chat, data]),
  });

  const { mutate: saveMeal } = useMeals();

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

  console.log('chat', chat);

  return (
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
        <Button mode="outlined" onPress={handleSend} style={styles.button}>
          Send
        </Button>
      </View>
    </View>
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
  button: {
    width: '100%',
    marginBottom: 10,
  },
});

export default Chat;
