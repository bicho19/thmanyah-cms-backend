import { pino } from 'pino';
import { env } from '@/config/env';

// Define the default level. 'info' is good for production/development.
const defaultLevel = 'debug';

// Determine the logging level.
// If NODE_ENV is 'test', set level to 'silent' to disable logging.
// Otherwise, use the LOG_LEVEL from .env or default to 'info'.
const level = process.env.APP_ENV === 'test' ? 'silent' : process.env.LOG_LEVEL || defaultLevel;

const appLogger = pino({
	name: 'backend-logger',
	level: level,
	transport:
		env?.APP_ENV === 'development'
			? // If in Development, print to the console using pretty print
				{
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'HH:MM:ss.l Z',
						ignore: 'pid,hostname',
					},
				}
			: // else send it to Something else
				// TODO: Add prod logging option here
				{
					target: 'pino-pretty',
					options: {
						colorize: true,
						translateTime: 'HH:MM:ss Z',
						ignore: 'pid,hostname',
					},
				},
});

export default appLogger;
