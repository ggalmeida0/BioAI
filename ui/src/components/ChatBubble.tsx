import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import ReactMarkdown from 'react-markdown';
import { Message } from '../hooks/useChat';

type ChatBubbleProps = {
  role: 'assistant' | 'user';
  message: Message;
  isLoading: boolean;
};

const ChatBubble = ({ role, message, isLoading }: ChatBubbleProps) => {
  const [completedTyping, setCompletedTyping] = useState(false);
  const [displayResponse, setDisplayResponse] = useState('');

  useEffect(() => {
    if (!message.content) {
      setCompletedTyping(true);
      setDisplayResponse('');
      return;
    }
    setCompletedTyping(false);

    let i = 0;

    const intervalId = setInterval(() => {
      setDisplayResponse(message.content!.slice(0, i));

      i++;

      if (i > message.content!.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [message.content]);

  const avatarImg = useMemo(
    () =>
      role === 'assistant' ? (
        <Avatar.Image source={require('../../assets/bio.png')} />
      ) : (
        <AntDesign name="user" size={24} color="black" />
      ),
    [role]
  );

  return (
    <View style={styles.message}>
      <View style={styles.avatar}>
        {avatarImg}
        {isLoading && <ActivityIndicator />}
      </View>
      {!isLoading && <ReactMarkdown>{displayResponse}</ReactMarkdown>}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: 10,
  },
  avatar: { display: 'flex', flexDirection: 'row', gap: 10 },
});

export default ChatBubble;
