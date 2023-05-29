import { SecretsManager } from 'aws-sdk';
import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from 'openai';

export const SYSTEM_MESSAGE: ChatCompletionRequestMessage = {
  role: ChatCompletionRequestMessageRoleEnum.System,
  content: `
  You are an assistant whose goal is to help the user to achieve their nutrition goals. Your name is Bio.

  You do that by asking the user what they have been eating an doing your best to break down the macro-nutrients, micro-nutrients and calories of the foods.

  You will then store this information for the user to reference later.
`,
};

export const INITIAL_GREETING =
  'Hello, my name is Bio and I am your nutrition assistant. I can help you by breaking down the macro-nutrients, micro-nutrients, and calories in the foods you eat. With my help, you can easily track your food intake and maintain a healthy, balanced diet to achieve your health and fitness goals.';

const OpenAIClientFactory = async (): Promise<OpenAIApi> => {
  try {
    const secretManagerClient = new SecretsManager({ region: 'us-east-2' });
    const credentialsSecret = await secretManagerClient
      .getSecretValue({ SecretId: 'prod/bio' })
      .promise();
    const apiKey = JSON.parse(
      credentialsSecret.SecretString || ''
    ).OPENAI_API_KEY;
    const configuration = new Configuration({
      organization: 'org-0nCbMxaROs5ezAvk6hU9LypS',
      apiKey,
    });

    return new OpenAIApi(configuration);
  } catch (error) {
    console.error('Failed to intialize OpenAI client: ', error);
    throw error;
  }
};

export default OpenAIClientFactory;
