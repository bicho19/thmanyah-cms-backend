import path, { parse } from 'node:path';
import { getCurrentDirName } from '@utils/current-dir-name';
import { isProduction } from '@utils/is-production';
import glob from 'fast-glob';
import lodash from 'lodash';
import { ContainerInfraKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import type { AppContainer } from '@/lib/app-container';
import type { AppLogger } from '@/types/common';
import type { Event, Subscriber } from '@/types/event-bus';
import type { SubscriberArgs, SubscriberConfig } from '@/types/event-bus/subscriber.types';

type SubscribersLoaderParams = {
	container: AppContainer;
	[ContainerInfraKeys.LOGGER]: AppLogger;
};

type SubscriberHandler<T> = (args: SubscriberArgs<T>) => Promise<void>;
type SubscriberModule<T> = {
	config: SubscriberConfig;
	handler: SubscriberHandler<T>;
};

/**
 * The list of file names to exclude from the subscriber scan
 */
const excludes: RegExp[] = [
	/index\.js/,
	/index\.ts/,
	/\.DS_Store/,
	/(\.ts\.map|\.js\.map|\.d\.ts|\.md)/,
	/^_[^/\\]*(\.[^/\\]+)?$/,
];

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const subscriberDescriptors: Map<string, SubscriberModule<any>> = new Map();

/**
 * Registers all subscribers
 */
export default async ({ container, logger }: SubscribersLoaderParams): Promise<void> => {
	logger.info(' ----- Initializing event subscribers -----');

	const subscribersPath = '../modules/**/subscribers/*.subscriber.{ts,js}';
	const coreFull = path.join(getCurrentDirName(import.meta.url), subscribersPath);

	const coreSubscribers = glob.sync(coreFull, {
		cwd: getCurrentDirName(import.meta.url),
		ignore: ['index.js', 'index.ts', 'index.js.map'],
	});

	if (!coreSubscribers) {
		logger.warn('No subscribers found, skipping.');
		return;
	}

	logger.debug({ coreSubscribers }, 'List of subscribers');
	for (const coreSubscriber of coreSubscribers) {
		await createDescriptor(coreSubscriber);
	}

	for (const [fileName, { config, handler }] of subscriberDescriptors.entries()) {
		await createSubscriber({
			fileName,
			config,
			handler,
			container,
		});
	}

	logger.info({ totalSubscribers: coreSubscribers.length }, 'Subscribers initialized and registered.');
};

async function createSubscriber<T>({
	fileName,
	config,
	handler,
	container,
}: {
	fileName: string;
	config: SubscriberConfig;
	handler: SubscriberHandler<T>;
	container: AppContainer;
}) {
	const eventBus: AbstractEventBus = container.resolve(ContainerInfraKeys.EVENT_BUS);

	const { event } = config;

	const events = Array.isArray(event) ? event : [event];

	const subscriberId = inferIdentifier(fileName, config, handler);

	for (const e of events) {
		const subscriber = async (data: T) => {
			return await handler({
				event: { name: e, ...data } as unknown as Event<T>,
				container,
				options: {},
			});
		};

		eventBus.subscribe(e, subscriber as Subscriber, {
			...config.context,
			subscriberId,
		});
	}
}

const createDescriptor = async (absolutePath: string) => {
	return await import(absolutePath).then((module_) => {
		const isValid = validateSubscriber(module_, absolutePath);

		if (!isValid) {
			return;
		}

		subscriberDescriptors.set(absolutePath, {
			config: module_.config,
			handler: module_.default,
		});
	});
};

const validateSubscriber = (
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	subscriber: any,
	path: string,
): subscriber is {
	default: SubscriberHandler<unknown>;
	config: SubscriberConfig;
} => {
	const handler = subscriber.default;

	if (!handler || typeof handler !== 'function') {
		/**
		 * If the handler is not a function, we can't use it
		 */
		console.warn(`The subscriber in ${path} is not a function. skipped.`);
		return false;
	}

	const config = subscriber.config;

	if (!config) {
		/**
		 * If the subscriber is missing a config, we can't use it
		 */
		console.warn(`The subscriber in ${path} is missing a config. skipped.`);
		return false;
	}

	if (!config.event) {
		/**
		 * If the subscriber is missing an event, we can't use it.
		 * In production, we throw an error, else we log a warning
		 */
		if (isProduction()) {
			throw new Error(`The subscriber in ${path} is missing an event in the config.`);
		}
		console.warn(`The subscriber in ${path} is missing an event in the config. skipped.`);

		return false;
	}

	const events = Array.isArray(config.event) ? config.event : [config.event];

	if (events.some((e: unknown) => !(typeof e === 'string'))) {
		/**
		 * If the subscribers event is not a string or an array of strings, we can't use it
		 */
		console.warn(
			`The subscriber in ${path} has an invalid event config. The event must be a string or an array of strings. skipped.`,
		);
		return false;
	}

	return true;
};

function inferIdentifier<T>(fileName: string, { context }: SubscriberConfig, handler: SubscriberHandler<T>) {
	/**
	 * If subscriberId is provided, use that
	 */
	if (context?.subscriberId) {
		return context.subscriberId;
	}

	const handlerName = handler.name;

	/**
	 * If the handler is not anonymous, use the name
	 */
	if (handlerName && !handlerName.startsWith('_default')) {
		return lodash.kebabCase(handlerName);
	}

	/**
	 * If the handler is anonymous, use the file name
	 */
	const idFromFile = parse(fileName).name;
	return lodash.kebabCase(idFromFile);
}
