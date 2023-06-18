import { encoding_for_model } from "@dqbd/tiktoken"
import { Message } from "../types/messages";

export const trimTokensToFitInContext = (messages: Message[]): Message[] => {
    const tokenEncoding = encoding_for_model('gpt-3.5-turbo')
    return messages.reverse().reduce<{contextSize: number, messages: Message[]}>((acc, curr) => {
        const { contextSize } = acc;
        if (contextSize < 4000 && curr.content) {
            const contentTokenSize = tokenEncoding.encode(curr.content).length
            return ((contextSize + contentTokenSize) <= 4000) ? {contextSize: contentTokenSize + contextSize, messages: [...acc.messages, curr]} : acc
        }
        return acc
    },{contextSize:0, messages:[]}).messages
}