import type { ICacheProvider } from '@/infra/cache/cache.types';

/**
 * An abstract base class for all cache provider implementations.
 *
 * This class implements the `ICacheProvider` interface, ensuring that any
 * provider extending it adheres to the required contract for caching operations.
 *
 * It is the ideal place to add any helper methods or common logic that might

 * be shared across different caching strategies in the future.
 */
export abstract class AbstractCacheProvider implements ICacheProvider {
	/**
	 * Abstract definition for retrieving a value.
	 * Concrete providers must implement their specific `get` logic.
	 */
	abstract get<T>(key: string): Promise<T | null>;

	/**
	 * Abstract definition for storing a value.
	 * Concrete providers must implement their specific `set` logic.
	 */
	abstract set(key: string, value: any, ttlSeconds?: number): Promise<void>;

	/**
	 * Abstract definition for deleting a value by its key.
	 */
	abstract forget(key: string): Promise<void>;

	/**
	 * Abstract definition for clearing the entire cache.
	 */
	abstract flush(): Promise<void>;

	/**
	 * Abstract definition for associating keys with tags.
	 */
	abstract addKeysToTags(tags: string[], keys: string[]): Promise<void>;

	/**
	 * Abstract definition for retrieving all keys associated with a set of tags.
	 */
	abstract getKeysByTags(tags: string[]): Promise<string[]>;
}
