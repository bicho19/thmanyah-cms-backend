import type { AppContainer } from '@/lib/app-container';
import type { Event } from './common';

interface SubscriberContext extends Record<string, unknown> {
	subscriberId?: string;
}

export type SubscriberConfig = {
	event: string | string[];
	context: SubscriberContext;
};

export type SubscriberArgs<T> = {
	event: Event<T>;
	container: AppContainer;
	options: Record<string, unknown>;
};
