import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageFunctionCall,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import { Meal } from './meals';
import { DatedMeal } from '../clients/DynamoDBFacade';

export type Message = { meal?: Meal } & ChatCompletionRequestMessage;

export class SystemMessage implements Message {
  public content: string;
  public role: ChatCompletionRequestMessageRoleEnum =
    ChatCompletionRequestMessageRoleEnum.System;

  constructor(content: string) {
    this.content = content;
  }
}

export class UserMessage implements Message {
  public content: string;
  public role: ChatCompletionRequestMessageRoleEnum =
    ChatCompletionRequestMessageRoleEnum.User;

  constructor(content: string) {
    this.content = content;
  }
}

type AssitantMessageParams = {
  content: string;
  meal?: Meal;
  datedMeals?: DatedMeal[];
};

export class AssistantMessage implements Message {
  public content: string;
  public role: ChatCompletionRequestMessageRoleEnum =
    ChatCompletionRequestMessageRoleEnum.Assistant;
  public meal?: Meal;
  public function_call?: ChatCompletionRequestMessageFunctionCall;
  public datedMeals?: DatedMeal[];

  constructor({ content, meal, datedMeals }: AssitantMessageParams) {
    this.content = content;
    this.meal = meal;
    this.datedMeals = datedMeals;
  }
}
