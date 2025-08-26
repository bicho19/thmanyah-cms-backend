import { env } from '@/config/env';
import type { ConfigModule } from '@/types/config-module';

module.exports = {
	baseConfig: {
		app_env: env.APP_ENV,
		jwt_secret: env.SECRET_KEY,
		database_uri: env.DATABASE_URI,
		redis: {
			uri: env.REDIS_URI,
			options: {},
		},
	},
	eventBus: {
		provider: env.EVENT_BUS_PROVIDER,
		redisOptions: null,
	},
	fileService: {
		provider: 'local',
	},
	queue: {
		enabled: true,
		provider: 'local',
	},
	// TODO: Update the job queue config and module
	// queue: {
	//   enabled: true,
	//   provider: 'bullmq', // 'sync' or 'bullmq'
	//   redisUrl: process.env.REDIS_URL,
	//   bullmqOptions: {
	//     queueName: 'my-app-queue',
	//     prefix: 'my-app',
	//     defaultJobOptions: {
	//       removeOnComplete: true,
	//       removeOnFail: 1000,
	//     },
	//   },
	// },
} satisfies ConfigModule;
