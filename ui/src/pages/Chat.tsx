import { Button, TextInput } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import useChat, { Message } from '../hooks/useChat';
import { useEffect, useMemo, useState } from 'react';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import ChatBubble from '../components/ChatBubble';

const User = 'user';
const Assistant = 'assistant';

const Chat = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState<Message[]>([]);

  const {
    messagesContext: { data: savedChatMessages },
    senderContext: { mutate: sendChat, isLoading: sendingChat },
  } = useChat({
    onSendSuccess: (data: Message) => setChat([...chat, data]),
  });

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

  console.log(chat);

  const bioLastMessage = useMemo(
    () =>
      chat.reduce((acc, curr) => (curr.role === Assistant ? curr : acc), {
        content: '',
        role: Assistant,
      })?.content,
    [chat]
  );

  const userLastMessage = useMemo(
    () =>
      chat.reduce((acc, curr) => (curr.role === User ? curr : acc), {
        content: '',
        role: User,
      })?.content,
    [chat]
  );

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
