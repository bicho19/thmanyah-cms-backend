import type { ITransactionBaseService } from "../transaction-base"
import type { Message, Subscriber, SubscriberContext } from "./common"

export interface IEventBusService extends ITransactionBaseService {
  subscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context?: SubscriberContext
  ): this

  unsubscribe(
    eventName: string | symbol,
    subscriber: Subscriber,
    context?: SubscriberContext
  ): this

  // biome-ignore lint/suspicious/noConfusingVoidType: <explanation>
  emit<T>(data: Message<T> | Message<T>[]): Promise<unknown | void>
}
