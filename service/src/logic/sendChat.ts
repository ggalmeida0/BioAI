import { Message, UserMessage } from '../models/messages';
import { SendChatInput } from './service';

const sendChat = async (input: SendChatInput) => {
  const { userId, userMessage: message, openAI, ddbChat } = input;

  console.log('User', userId, 'Sending message: ', message);

  const chatHistory = await ddbChat.getMessages();

  const userMessage = new UserMessage(message);

  const messageSequence: Message[] = [
    ...chatHistory.map((chat) => chat.messages).flat(),
    userMessage,
  ];

  const llmResponse = await openAI.sendChat(messageSequence);

  console.log('LLM response: ', llmResponse);

  await ddbChat.addMessages([userMessage, llmResponse]);

  return llmResponse;
};

export default sendChat;
