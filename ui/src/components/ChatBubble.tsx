import { ChatCompletionResponseMessageRoleEnum } from 'openai';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';

type ChatBubbleProps = {
  role: ChatCompletionResponseMessageRoleEnum;
  message: string;
  isLoading: boolean;
};

const { User, Assistant } = ChatCompletionResponseMessageRoleEnum;

const ChatBubble = ({ role, message, isLoading }: ChatBubbleProps) => {
  const [completedTyping, setCompletedTyping] = useState(false);
  const [displayResponse, setDisplayResponse] = useState('');

  useEffect(() => {
    setCompletedTyping(false);

    let i = 0;

    const intervalId = setInterval(() => {
      setDisplayResponse(message.slice(0, i));

      i++;

      if (i > message.length) {
        clearInterval(intervalId);
        setCompletedTyping(true);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [message]);

  const avatarImg = useMemo(
    () =>
      role === Assistant ? (
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
      {!isLoading && <p>{displayResponse}</p>}
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
