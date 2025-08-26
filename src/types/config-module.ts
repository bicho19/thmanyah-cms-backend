import type { RedisOptions } from 'ioredis';

/**
 * @interface
 *
 * Essential configurations related to the Medusa backend, such as database and CORS configurations.
 */
export type BaseConfigOptions = {
	app_env: string;
	/**
	 * A random string used to create authenticateAdmin tokens. Although this configuration option is not required, it’s highly recommended to set it for better security.
	 */
	jwt_secret: string;

	/**
	 * The uri of the database to connect to
	 */
	database_uri: string;

	/**
	 * The uri of the Redis database to connect to.
	 */
	redis: {
		uri: string;
		options: RedisOptions;
	};
};

export type EventBusConfigOptions = {
	provider: 'in-memory' | 'redis';
	redisOptions: {
		url: string;
	} | null;
};

export type FileServiceConfigOptions = {
	provider: 'local' | 's3' | 'default';
	s3Options?: {
		region: string;
		bucket: string;
		access_key_id: string;
		secret_access_key: string;
		endpoint?: string | null;
		download_url_duration: number;
	};
	localOptions?: {
		upload_dir: string;
		base_url: string;
	};
};

type LockingConfigOptions = {
	provider: 'in-memory' | 'redis';
	redisOptions: {
		url: string;
	} | null;
};

type QueueConfig = {
	enabled: boolean;
	provider: 'local' | 'bullmq';
	redisUrl?: string;
	bullmqOptions?: {
		queueName?: string;
		prefix?: string;
		defaultJobOptions?: {
			removeOnComplete?: boolean;
			removeOnFail?: number;
		};
	};
};

type IntegrationsConfig = {
	youtube?: {
		apiKey?: string;
	};
};

type CacheConfig = {
	provider: 'in-memory' | 'redis';
};

export type ConfigModule = {
	baseConfig: BaseConfigOptions;
	eventBus: EventBusConfigOptions;
	fileService?: FileServiceConfigOptions;
	locking?: LockingConfigOptions;
	queue?: QueueConfig;
	cache?: CacheConfig;
	integrations?: IntegrationsConfig;
};
