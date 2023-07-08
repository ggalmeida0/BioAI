import { Meal } from '../types/meals';
import { Message } from '../types/messages';

const asOpenAIModel = (messages: Message[]) =>
  messages.map((message) => ({
    content: createOpenAIContent(message.content, message.meal),
    role: message.role,
  }));

const createOpenAIContent = (
  content: string | undefined,
  breakdown: Meal | undefined
) =>
  [content, serializeOrNull(breakdown)].reduce<string>(
    (acc, curr) => (curr ? acc + curr : acc),
    ''
  );

const serializeOrNull = (object: any) => {
  try {
    return JSON.stringify(object);
  } catch {
    return null;
  }
};

export default { asOpenAIModel };
