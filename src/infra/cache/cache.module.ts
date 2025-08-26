import { ContainerInfraKeys } from '@/infra/constants';
import type { ICacheModule, ICacheProvider, ITaggableCache } from './cache.types';

/**
 * The public-facing service for interacting with the application cache.
 * This class provides a clean, high-level API and orchestrates the underlying
 * cache provider to support simple and tagged caching operations.
 */
export class CacheModule implements ICacheModule {
	private readonly provider: ICacheProvider;

	constructor({ _cache_provider }: { [ContainerInfraKeys.CACHE_PROVIDER]: ICacheProvider }) {
		this.provider = _cache_provider;
	}

	async get<T>(key: string): Promise<T | null> {
		return this.provider.get(key);
	}

	async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
		await this.provider.set(key, value, ttlSeconds);
	}

	async has(key: string): Promise<boolean> {
		return (await this.provider.get(key)) !== null;
	}

	async forget(key: string): Promise<void> {
		await this.provider.forget(key);
	}

	async flush(): Promise<void> {
		await this.provider.flush();
	}

	async remember<T>(key: string, ttlSeconds: number, resolver: () => Promise<T>): Promise<T> {
		let value = await this.get<T>(key);
		if (value !== null) {
			return value;
		}

		value = await resolver();
		await this.set(key, value, ttlSeconds);
		return value;
	}

	tags(tags: string[]): ITaggableCache {
		// Return a new object that encapsulates the provider and the tags.
		// This creates a clean, chainable API: `cache.tags(['products']).set(...)`
		return new TaggableCache(this.provider, tags);
	}
}

/**
 * An internal class that implements the ITaggableCache interface.
 * It is created and returned by the `CacheModule.tags()` method.
 */
class TaggableCache implements ITaggableCache {
	constructor(
		private readonly provider: ICacheProvider,
		private readonly tags: string[],
	) {}

	async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
		await this.provider.set(key, value, ttlSeconds);
		await this.provider.addKeysToTags(this.tags, [key]);
	}

	async remember<T>(key: string, ttlSeconds: number, resolver: () => Promise<T>): Promise<T> {
		let value = await this.provider.get<T>(key);
		if (value !== null) {
			return value;
		}

		value = await resolver();
		await this.set(key, value, ttlSeconds); // Uses the tagged set method
		return value;
	}

	async flush(): Promise<void> {
		const keys = await this.provider.getKeysByTags(this.tags);
		if (keys.length > 0) {
			const forgetPromises = keys.map((key) => this.provider.forget(key));
			await Promise.all(forgetPromises);
		}
	}
}
