import { EventEmitter } from 'node:events';
import { ulid } from 'ulid';
import { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import type { AppContainer } from '@/lib/app-container';
import type { EventBusTypes } from '@/types/bundles';
import type { AppLogger } from '@/types/common';

type InjectedDependencies = {
	logger: AppLogger;
};

type StagingQueueType = Map<string, EventBusTypes.Message[]>;

const eventEmitter = new EventEmitter();
eventEmitter.setMaxListeners(Number.POSITIVE_INFINITY);

export default class LocalEventBus extends AbstractEventBus {
	protected readonly logger_?: AppLogger;
	protected readonly eventEmitter_: EventEmitter;
	protected groupedEventsMap_: StagingQueueType;

	constructor({ logger }: AppContainer & InjectedDependencies) {
		super();

		this.logger_ = logger;
		this.eventEmitter_ = eventEmitter;
		this.groupedEventsMap_ = new Map();
	}

	/**
	 * Accept an event name and some options
	 *
	 * @param eventsData
	 * @param options The options can include `internal` which will prevent the event from being logged
	 */
	async emit<T = unknown>(
		eventsData: EventBusTypes.Message<T> | EventBusTypes.Message<T>[],
		options: Record<string, unknown> = {},
	): Promise<void> {
		const normalizedEventsData = Array.isArray(eventsData) ? eventsData : [eventsData];

		for (const eventData of normalizedEventsData) {
			const eventListenersCount = this.eventEmitter_.listenerCount(eventData.name);

			if (!options.internal && !eventData.options?.internal) {
				this.logger_?.info(`Processing ${eventData.name} which has ${eventListenersCount} subscribers`);
			}

			if (eventListenersCount === 0) {
				continue;
			}

			await this.groupOrEmitEvent(eventData);
		}
	}

	// If the data of the event consists of a eventGroupId, we don't emit the event, instead
	// we add them to a queue grouped by the eventGroupId and release them when
	// explicitly requested.
	// This is useful in the event of a distributed transaction where you'd want to emit
	// events only once the transaction ends.
	private async groupOrEmitEvent<T = unknown>(eventData: EventBusTypes.Message<T>) {
		const { options, ...eventBody } = eventData;
		const eventGroupId = eventBody.metadata?.eventGroupId;

		if (eventGroupId) {
			await this.groupEvent(eventGroupId, eventData);
		} else {
			const { options, ...eventBody } = eventData;
			this.eventEmitter_.emit(eventData.name, eventBody);
		}
	}

	// Groups an event to a queue to be emitted upon explicit release
	private async groupEvent<T = unknown>(eventGroupId: string, eventData: EventBusTypes.Message<T>) {
		const groupedEvents = this.groupedEventsMap_.get(eventGroupId) || [];

		groupedEvents.push(eventData);

		this.groupedEventsMap_.set(eventGroupId, groupedEvents);
	}

	async releaseGroupedEvents(eventGroupId: string) {
		const groupedEvents = this.groupedEventsMap_.get(eventGroupId) || [];

		for (const event of groupedEvents) {
			const { options, ...eventBody } = event;

			this.eventEmitter_.emit(event.name, eventBody);
		}

		await this.clearGroupedEvents(eventGroupId);
	}

	async clearGroupedEvents(eventGroupId: string) {
		this.groupedEventsMap_.delete(eventGroupId);
	}

	subscribe(event: string | symbol, subscriber: EventBusTypes.Subscriber): this {
		const randId = ulid();
		this.storeSubscribers({ event, subscriberId: randId, subscriber });
		this.eventEmitter_.on(event, async (data: Event) => {
			try {
				// @ts-ignore
				await subscriber(data);
			} catch (e) {
        console.log(e)
				this.logger_?.error(`An error occurred while processing ${event.toString()}: ${e}`);
			}
		});
		return this;
	}

	unsubscribe(
		event: string | symbol,
		subscriber: EventBusTypes.Subscriber,
		context?: EventBusTypes.SubscriberContext,
	): this {
		const existingSubscribers = this.eventToSubscribersMap_.get(event);

		if (existingSubscribers?.length) {
			const subIndex = existingSubscribers?.findIndex((sub) => sub.id === context?.subscriberId);

			if (subIndex !== -1) {
				this.eventToSubscribersMap_.get(event)?.splice(subIndex as number, 1);
			}
		}

		this.eventEmitter_.off(event, subscriber);
		return this;
	}
}
