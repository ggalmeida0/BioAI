import { SecretsManager } from 'aws-sdk';
import { Configuration, ChatCompletionFunctions, OpenAIApi } from 'openai';
import { AssistantMessage, Message, SystemMessage } from '../types/messages';
import DependencyError from '../errors/DependencyError';
import { DateTime } from 'luxon';

export const SYSTEM_MESSAGE: SystemMessage = new SystemMessage(`
  You are an assistant whose goal is to help the user to achieve their nutrition goals. Your name is Bio.

  You do that by asking the user what they have been eating an doing your best to break down the macro-nutrients, micro-nutrients and calories of the foods.

  You will then store this information for the user to reference later.
`);

export const INITIAL_GREETING =
  'Hello, my name is Bio and I am your nutrition assistant. I can help you by breaking down the macro-nutrients, micro-nutrients, and calories in the foods you eat. With my help, you can easily track your food intake and maintain a healthy, balanced diet to achieve your health and fitness goals.';

class OpenAI {
  private client: OpenAIApi;
  private model: string;
  private functions: ChatCompletionFunctions[];

  constructor(client: OpenAIApi) {
    this.model = 'gpt-3.5-turbo-0613';
    this.client = client;
    const today = DateTime.local().toFormat('yyyy-MM-dd');
    this.functions = [
      {
        name: 'getMeals',
        description: `Gets the saved meals the user ate for the given dates. For context, today is ${today}`,
        parameters: {
          type: 'object',
          properties: {
            dates: {
              type: 'array',
              items: {
                type: 'string',
                description: 'A date in the format YYYY-MM-DD',
              },
            },
          },
        },
      },
      {
        name: 'deleteMeal',
        description: `It deletes a single meal for a given date. For context, today is ${today}`,
        parameters: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              description: 'A date in the format YYYY-MM-DD',
            },
            mealTitle: {
              type: 'string',
              description: 'The title of the meal to be deleted',
            },
          },
        },
      },
    ];
  }

  static async init(): Promise<OpenAI> {
    const secretManagerClient = new SecretsManager({ region: 'us-east-2' });
    const credentialsSecret = await secretManagerClient
      .getSecretValue({ SecretId: 'openai' })
      .promise();
    const apiKey = JSON.parse(
      credentialsSecret.SecretString || ''
    ).OPENAI_API_KEY;
    const configuration = new Configuration({
      organization: 'org-0nCbMxaROs5ezAvk6hU9LypS',
      apiKey,
    });

    const client = new OpenAIApi(configuration);
    return new OpenAI(client);
  }

  async sendChat(
    messages: Message[],
    temperature: number = 0.5
  ): Promise<AssistantMessage> {
    const requestResponse = await this.client.createChatCompletion({
      model: this.model,
      messages,
      temperature,
      functions: this.functions,
    });

    const llmResponse = requestResponse.data.choices[0].message;

    if (!llmResponse) throw new DependencyError('No response from OpenAI');

    return llmResponse as AssistantMessage;
  }
}

export default OpenAI;
