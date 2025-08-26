import type { Context } from '../shared-context';

export type Subscriber<TData = unknown> = (data: Event<TData>) => Promise<void>;

export type SubscriberContext = {
	subscriberId: string;
};

export type SubscriberDescriptor = {
	id: string;
	subscriber: Subscriber;
};

export type EventMetadata = Record<string, unknown> & {
	correlationId: string;
	timestamp: number;
	eventGroupId?: string;
};

export type Event<TData> = {
	name: string;
	metadata: EventMetadata;
	data: TData;
};

export type Message<TData = unknown> = Event<TData> & {
	options?: Record<string, unknown>;
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type RawMessageFormat<TData = any> = {
	eventName: string;
	data: TData;
	source: string;
	object: string;
	action?: string;
	context?: Pick<Context, 'eventGroupId'>;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	options?: Record<string, any>;
};
