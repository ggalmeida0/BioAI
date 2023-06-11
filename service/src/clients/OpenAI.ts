import { SecretsManager } from 'aws-sdk';
import { Configuration, OpenAIApi } from 'openai';
import { AssistantMessage, Message, SystemMessage } from '../types/messages';
import DependencyError from '../errors/DependencyError';

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

  constructor(client: OpenAIApi) {
    this.model = 'gpt-3.5-turbo';
    this.client = client;
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
    });

    const llmResponse = requestResponse.data.choices[0].message;

    if (!llmResponse) throw new DependencyError('No response from OpenAI');

    return llmResponse as AssistantMessage;
  }
}

export default OpenAI;
