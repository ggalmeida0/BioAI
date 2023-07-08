import { ChatCompletionRequestMessageRoleEnum } from 'openai';
import { ChatSession } from '../clients/DynamoDBFacade';
import { Meal } from '../types/meals';
import { Message } from '../types/messages';

function asOpenAIModel(messages: Message[]): Message[];
function asOpenAIModel(session: ChatSession[]): Message[];

function asOpenAIModel(input: any): Message[] {
  if (input.date) {
    const sessions = input as ChatSession[];
    return sessions.flatMap((session) => {
      const messages = asOpenAIModel(session.messages);
      const meals = serializeOrNull(session.meals);
      return [
        ...messages,
        {
          content: meals,
          role: ChatCompletionRequestMessageRoleEnum.System,
        } as Message,
      ];
    });
  } else {
    const messages = input as Message[];
    return messages.map((message) => ({
      content: createOpenAIContent(message.content, message.meal),
      role: message.role,
    }));
  }
}

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
