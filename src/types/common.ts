import type { Logger } from 'pino';

export type PartialPick<T, K extends keyof T> = {
	[P in K]?: T[P];
};

export type AppLogger = Logger;
