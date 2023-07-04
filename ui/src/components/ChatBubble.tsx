import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

type ChatBubbleProps = {
  role: string;
  message: Message;
  isLoading?: boolean;
};

const ChatBubble = ({ role, message, isLoading }: ChatBubbleProps) => {
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

  useEffect(() => {
    if (!message.content) {
      setDisplayResponse('');
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

  const avatarImg = useMemo(() =>
    role === 'assistant' ? (
      <Avatar.Image source={require('../../assets/bio.png')} style={styles.bioAvatar} size={84} />
    ) : (
      <AntDesign name="user" size={24} color="black" />
    ),
    [role]
  );

  const bubbleStyle = role === 'assistant' ? styles.assistantBubble : styles.userBubble;
  const textStyle = role === 'assistant' ? styles.assistantText : styles.userText;

  return (
    <View style={[styles.message, bubbleStyle]}>
      <View style={styles.avatar}>
        {avatarImg}
        {isLoading && <ActivityIndicator />}
      </View>
      {!isLoading && (
        <HTML
          source={{
            html: htmlResponse,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  message: {
    display: 'flex',
    alignItems: 'center',
    textAlign: 'center',
    margin: 10,
    borderRadius: 8,
    padding: 8,
  },
  userBubble: {
    backgroundColor: '#333',
    alignSelf: 'flex-end',
  },
  assistantBubble: {
    backgroundColor: '#f0f0f0',
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
    gap: 10,
  },
  bioAvatar: {
    backgroundColor: 'transparent',
  },
});

export default ChatBubble;
