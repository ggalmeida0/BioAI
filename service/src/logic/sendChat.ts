import { Message, SystemMessage, UserMessage } from '../models/messages';
import { SendChatInput } from './service';

const BREAKDOWN_PROMPT =
  'Look at the message to follow, output any nutritional breakdown in JSON format. If there is no nutritional breakdown, output an empty object. Dont say any english, just JSON';

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

  const breakdown = await openAI.sendChat([
    new SystemMessage(BREAKDOWN_PROMPT),
    llmResponse,
  ]);

  console.log('Breakdown: ', breakdown);

  await ddbChat.addMessages([userMessage, llmResponse]);

  return llmResponse;
};

export default sendChat;
