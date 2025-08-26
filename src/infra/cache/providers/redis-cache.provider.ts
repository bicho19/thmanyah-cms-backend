import type { Redis } from 'ioredis';
import { AbstractCacheProvider } from '@/infra/cache/abstract-cache-provider';

/**
 * A cache provider using Redis.
 * This class extends the AbstractCacheProvider, fulfilling its contract.
 * It uses standard GET/SET for key-value caching and Redis Sets (`SADD`, `SMEMBERS`)
 * to efficiently manage tag-to-key relationships for tag-based invalidation.
 */
export class RedisCacheProvider extends AbstractCacheProvider {
	private readonly redis: Redis;
	private readonly keyPrefix: string;
	private readonly tagPrefix: string = 'tags:';

	constructor({ redisConnection }: { redisConnection: Redis }, options: { prefix?: string } = {}) {
		super();
		this.redis = redisConnection;
		this.keyPrefix = options.prefix ?? 'cache:';
	}

	private prefixedKey(key: string): string {
		return `${this.keyPrefix}${key}`;
	}

	private prefixedTag(tag: string): string {
		return `${this.keyPrefix}${this.tagPrefix}${tag}`;
	}

	async get<T>(key: string): Promise<T | null> {
		const value = await this.redis.get(this.prefixedKey(key));
		return value ? JSON.parse(value) : null;
	}

	async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
		const redisKey = this.prefixedKey(key);
		const serializedValue = JSON.stringify(value);
		if (ttlSeconds) {
			await this.redis.set(redisKey, serializedValue, 'EX', ttlSeconds);
		} else {
			await this.redis.set(redisKey, serializedValue);
		}
	}

	async forget(key: string): Promise<void> {
		await this.redis.del(this.prefixedKey(key));
	}

	async flush(): Promise<void> {
		const keys = await this.redis.keys(`${this.keyPrefix}*`);
		if (keys.length > 0) {
			await this.redis.del(keys);
		}
	}

	// --- Tag-specific logic using Redis Sets ---

	async addKeysToTags(tags: string[], keys: string[]): Promise<void> {
		const pipeline = this.redis.pipeline();
		const prefixedKeys = keys.map((k) => this.prefixedKey(k));

		for (const tag of tags) {
			pipeline.sadd(this.prefixedTag(tag), ...prefixedKeys);
		}
		await pipeline.exec();
	}

	async getKeysByTags(tags: string[]): Promise<string[]> {
		if (tags.length === 0) return [];

		// Use SUNION to get the union of all keys from all tag sets.
		const prefixedTags = tags.map((t) => this.prefixedTag(t));
		return this.redis.sunion(prefixedTags);
	}
}
