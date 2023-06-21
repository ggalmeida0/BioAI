import { Message } from '../types/messages';

const asOpenAIModel = (messages: Message[]) =>
  messages.map((message) => ({ content: message.content, role: message.role }));

export default { asOpenAIModel };
