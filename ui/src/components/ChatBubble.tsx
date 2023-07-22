import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { ActivityIndicator, Avatar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import HTML from 'react-native-render-html';
import { unified } from 'unified';
import markdown from 'remark-parse';
import remark2rehype from 'remark-rehype';
import doc from 'rehype-document';
import format from 'rehype-format';
import html from 'rehype-stringify';
import { Message } from '../hooks/useChat';
import { DateTime } from 'luxon';

type ChatBubbleProps = {
  role: string;
  message: Message;
  isLoading?: boolean;
  onContentChange?: () => void;
  isAnimated: boolean;
};

const ChatBubble = ({
  role,
  message,
  isLoading,
  onContentChange,
  isAnimated,
}: ChatBubbleProps) => {
  const [htmlResponse, setHtmlResponse] = useState('');
  const [displayResponse, setDisplayResponse] = useState('');

  useEffect(() => {
    unified()
      .use(markdown)
      .use(remark2rehype)
      .use(doc)
      .use(format)
      .use(html)
      .process(displayResponse, (err, file) => {
        if (err) throw err;
        setHtmlResponse(String(file));
      });
  }, [displayResponse]);

  useEffect(() => onContentChange?.(), [htmlResponse]);

  useEffect(() => {
    if (!message.content) {
      setDisplayResponse('');
      return;
    }
    if (!isAnimated) {
      setDisplayResponse(message.content);
      return;
    }
    let i = 0;

    const intervalId = setInterval(() => {
      setDisplayResponse(message.content!.slice(0, i));

      i++;

      if (i > message.content!.length) {
        clearInterval(intervalId);
      }
    }, 10);

    return () => clearInterval(intervalId);
  }, [message.content]);

  const avatarImg = useMemo(
    () =>
      role === 'assistant' ? (
        <Avatar.Image
          source={require('../../assets/bio.png')}
          style={styles.bioAvatar}
          size={84}
        />
      ) : (
        <AntDesign name="user" size={48} />
      ),
    [role]
  );

  const bubbleStyle =
    role === 'assistant' ? styles.assistantBubble : styles.userBubble;
  const textStyle =
    role === 'assistant' ? styles.assistantText : styles.userText;

    const formattedTimestamp = message.timestamp
    ? DateTime.fromISO(message.timestamp).toFormat('h:mm a')
    : DateTime.local().toFormat('h:mm a');

  return (
    <View style={[styles.message, bubbleStyle]}>
      <View style={styles.avatar}>
        {avatarImg}
        {isLoading && <ActivityIndicator />}
      </View>
      <View style={styles.messageContent}>
        {!isLoading && (
          <HTML
            source={{
              html: htmlResponse,
            }}
          />
        )}
        <Text style={[styles.timestamp, styles.boldText]}>{formattedTimestamp}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    display: 'flex',
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    textAlign: 'center',
    margin: 10,
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
  },
  userBubble: {
    backgroundColor: '#7A9CD1',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#A77BEA',
    alignSelf: 'flex-start',
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#000',
  },
  avatar: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    gap: 10,
  },
  bioAvatar: {
    backgroundColor: 'transparent',
  },
  messageContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timestamp: {
    fontSize: 10,
    color: 'black',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: 'bold',
  }
});

export default ChatBubble;
