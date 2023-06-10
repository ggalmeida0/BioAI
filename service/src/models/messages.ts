import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
} from 'openai';

export type Message = ChatCompletionRequestMessage;

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

  constructor(content: string) {
    this.content = content;
  }
}
