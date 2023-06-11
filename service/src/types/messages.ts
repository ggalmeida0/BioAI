import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';
import { Meal } from './meals';

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

export class AssistantMessage implements Message {
  public content: string;
  public role: ChatCompletionRequestMessageRoleEnum =
    ChatCompletionRequestMessageRoleEnum.Assistant;
  public meal?: Meal;

  constructor(content: string, meal?: Meal) {
    this.content = content;
    this.meal = meal;
  }
}
