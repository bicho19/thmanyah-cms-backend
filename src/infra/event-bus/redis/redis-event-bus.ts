import { promiseAll } from '@utils/promise-all';
import { type BulkJobOptions, Queue, Worker } from 'bullmq';
import type { Redis } from 'ioredis';
import { isPresent } from '@/core/utils/common/is-present';
import { ContainerInfraKeys } from '@/infra/constants';
import { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import type { BullJob, EventBusRedisModuleOptions, Options } from '@/infra/event-bus/redis/redis-types';
import type { EventBusTypes } from '@/types/bundles';
import type { AppLogger } from '@/types/common';

type InjectedDependencies = {
	logger: AppLogger;
	[ContainerInfraKeys.REDIS_CONNECTION]: Redis;
};

type IORedisEventType<T = unknown> = {
	name: string;
	data: Omit<EventBusTypes.Event<T>, 'name'>;
	opts: BulkJobOptions;
};

/**
 * Can keep track of multiple subscribers to different events and run the
 * subscribers when events happen. Events will run asynchronously.
 */
export default class RedisEventBus extends AbstractEventBus {
	protected readonly logger_: AppLogger;
	protected readonly moduleOptions_: EventBusRedisModuleOptions;
	protected readonly eventBusRedisConnection_: Redis;
	protected queue_: Queue;
	protected bullWorker_: Worker;
	protected readonly queueName_: string;

	constructor({ logger, __redis_connection__ }: InjectedDependencies, moduleOptions: EventBusRedisModuleOptions = {}) {
		super();

		this.logger_ = logger;
		this.eventBusRedisConnection_ = __redis_connection__;
		this.moduleOptions_ = moduleOptions;
		this.queueName_ = moduleOptions.queueName ?? 'events-queue';

		this.queue_ = new Queue(this.queueName_, {
			prefix: `${this.constructor.name}`,
			...(moduleOptions.queueOptions ?? {}),
			connection: __redis_connection__,
		});

		this.bullWorker_ = new Worker(this.queueName_, this.worker_, {
			prefix: `${this.constructor.name}`,
			...(moduleOptions.workerOptions ?? {}),
			connection: __redis_connection__,
		});
	}

	__hooks = {
		onApplicationShutdown: async () => {
			await this.queue_.close();
			this.eventBusRedisConnection_.disconnect();
		},
		onApplicationPrepareShutdown: async () => {
			this.bullWorker_?.close();
		},
	};

	private buildEvents<T>(eventsData: EventBusTypes.Message<T>[], options: Options = {}): IORedisEventType<T>[] {
		const opts = {
			// default options
			removeOnComplete: true,
			attempts: 1,
			// global options
			...(this.moduleOptions_.jobOptions ?? {}),
			...options,
		};

		return eventsData.map((eventData) => {
			// We want to preserve event data + metadata. However, bullmq only allows for a single data field.
			// Therefore, upon adding jobs to the queue we will serialize the event data and metadata into a single field
			// and upon processing the job, we will deserialize it back into the original format expected by the subscribers.
			const event = {
				data: eventData.data,
				metadata: eventData.metadata,
			};

			return {
				data: event,
				name: eventData.name,
				opts: {
					// options for event group
					...opts,
					// options for a particular event
					...eventData.options,
				},
			};
		});
	}

	/**
	 * Emit a single or number of events
	 * @param eventsData
	 * @param options
	 */
	async emit<T = unknown>(
		eventsData: EventBusTypes.Message<T> | EventBusTypes.Message<T>[],
		options: Options = {},
	): Promise<void> {
		const eventsDataArray = Array.isArray(eventsData) ? eventsData : [eventsData];

		const { groupedEventsTTL = 600 } = options;
		options.groupedEventsTTL = undefined;

		const eventsToEmit = eventsDataArray.filter((eventData) => !isPresent(eventData.metadata?.eventGroupId));

		const eventsToGroup = eventsDataArray.filter((eventData) => isPresent(eventData.metadata?.eventGroupId));

		const groupEventsMap = new Map<string, EventBusTypes.Message<T>[]>();

		for (const event of eventsToGroup) {
			const groupId = event.metadata?.eventGroupId as string;
			const groupEvents = groupEventsMap.get(groupId) ?? [];

			groupEvents.push(event);
			groupEventsMap.set(groupId, groupEvents);
		}

		const promises: Promise<unknown>[] = [];

		if (eventsToEmit.length) {
			const emitData = this.buildEvents(eventsToEmit, options);

			promises.push(this.queue_.addBulk(emitData));
		}

		for (const [groupId, events] of groupEventsMap.entries()) {
			if (!events?.length) {
				continue;
			}

			// Set a TTL for the key of the list that is scoped to a group
			// This will be helpful in preventing stale data from staying in redis for too long
			// in the event the module fails to cleanup events. For long running workflows, setting a much higher
			// TTL or even skipping the TTL would be required
			void this.setExpire(groupId, groupedEventsTTL);

			const eventsData = this.buildEvents(events, options);

			promises.push(this.groupEvents(groupId, eventsData));
		}

		await promiseAll(promises);
	}

	private async setExpire(eventGroupId: string, ttl: number) {
		if (!eventGroupId) {
			return;
		}

		await this.eventBusRedisConnection_.expire(`staging:${eventGroupId}`, ttl);
	}

	private async groupEvents<T = unknown>(eventGroupId: string, events: IORedisEventType<T>[]) {
		await this.eventBusRedisConnection_.rpush(
			`staging:${eventGroupId}`,
			...events.map((event) => JSON.stringify(event)),
		);
	}

	private async getGroupedEvents(eventGroupId: string): Promise<IORedisEventType[]> {
		return await this.eventBusRedisConnection_.lrange(`staging:${eventGroupId}`, 0, -1).then((result) => {
			return result.map((jsonString) => JSON.parse(jsonString));
		});
	}

	async releaseGroupedEvents(eventGroupId: string) {
		const groupedEvents = await this.getGroupedEvents(eventGroupId);

		await this.queue_.addBulk(groupedEvents);

		await this.clearGroupedEvents(eventGroupId);
	}

	async clearGroupedEvents(eventGroupId: string) {
		if (!eventGroupId) {
			return;
		}

		await this.eventBusRedisConnection_.del(`staging:${eventGroupId}`);
	}

	/**
	 * Handles incoming jobs.
	 * @param job The job object
	 * @return resolves to the results of the subscriber calls.
	 */
	worker_ = async <T>(job: BullJob<T>): Promise<unknown> => {
		const { data, name, opts } = job;
		const eventSubscribers = this.eventToSubscribersMap.get(name) || [];
		const wildcardSubscribers = this.eventToSubscribersMap.get('*') || [];

		const allSubscribers = eventSubscribers.concat(wildcardSubscribers);

		// Pull already completed subscribers from the job data
		const completedSubscribers = job.data.completedSubscriberIds || [];

		// Filter out already completed subscribers from the all subscribers
		const subscribersInCurrentAttempt = allSubscribers.filter(
			(subscriber) => subscriber.id && !completedSubscribers.includes(subscriber.id),
		);

		const currentAttempt = job.attemptsMade;
		const isRetry = currentAttempt > 1;
		const configuredAttempts = job.opts.attempts ?? 1;

		const isFinalAttempt = currentAttempt === configuredAttempts;

		if (!opts.internal) {
			if (isRetry) {
				if (isFinalAttempt) {
					this.logger_.info(`Final retry attempt for ${name}`);
				}

				this.logger_.info(
					`Retrying ${name} which has ${eventSubscribers.length} subscribers (${subscribersInCurrentAttempt.length} of them failed)`,
				);
			} else {
				this.logger_.info(`Processing ${name} which has ${eventSubscribers.length} subscribers`);
			}
		}

		const completedSubscribersInCurrentAttempt: string[] = [];

		const subscribersResult = await Promise.all(
			subscribersInCurrentAttempt.map(async ({ id, subscriber }) => {
				// De-serialize the event data and metadata from a single field into the original format expected by the subscribers
				const event = {
					name,
					data: data.data,
					metadata: data.metadata,
				};

				return await subscriber(event)
					.then(async (data) => {
						// For every subscriber that completes successfully, add their id to the list of completed subscribers
						completedSubscribersInCurrentAttempt.push(id);
						return data;
					})
					.catch((err) => {
						this.logger_.warn(`An error occurred while processing ${name}: ${err}`);
						return err;
					});
			}),
		);

		// If the number of completed subscribers is different from the number of subcribers to process in current attempt, some of them failed
		const didSubscribersFail = completedSubscribersInCurrentAttempt.length !== subscribersInCurrentAttempt.length;

		const isRetriesConfigured = configuredAttempts > 1;

		// Therefore, if retrying is configured, we try again
		const shouldRetry = didSubscribersFail && isRetriesConfigured && !isFinalAttempt;

		if (shouldRetry) {
			const updatedCompletedSubscribers = [...completedSubscribers, ...completedSubscribersInCurrentAttempt];

			job.data.completedSubscriberIds = updatedCompletedSubscribers;

			await job.updateData(job.data);

			const errorMessage = `One or more subscribers of ${name} failed. Retrying...`;

			this.logger_.warn(errorMessage);

			throw Error(errorMessage);
		}

		if (didSubscribersFail && !isFinalAttempt) {
			// If retrying is not configured, we log a warning to allow server admins to recover manually
			this.logger_.warn(
				`One or more subscribers of ${name} failed. Retrying is not configured. Use 'attempts' option when emitting events.`,
			);
		}

		return subscribersResult;
	};
}
