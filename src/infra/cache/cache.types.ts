/**
 * The contract for a cache provider that supports tagging.
 * The provider that backs the main cache module must implement this.
 */
export interface ICacheProvider {
	/**
	 * Retrieves a value from the cache by its key.
	 * @param key The unique key for the cache entry.
	 * @returns The stored value, or null if not found.
	 */
	get<T>(key: string): Promise<T | null>;

	/**
	 * Stores a value in the cache.
	 * @param key The unique key for the cache entry.
	 * @param value The value to store. It will be serialized.
	 * @param ttlSeconds The Time-To-Live for the entry in seconds.
	 */
	set(key: string, value: any, ttlSeconds?: number): Promise<void>;

	/**
	 * Removes a value from the cache by its key.
	 * @param key The key to delete.
	 */
	forget(key: string): Promise<void>;

	/**
	 * Deletes all entries from the entire cache. Use with caution.
	 */
	flush(): Promise<void>;

	/**
	 * Associates a cache key with one or more tags.
	 * This is used internally by the TaggableCache.
	 * @param tags An array of tag names.
	 * @param keys An array of cache keys to associate with the tags.
	 */
	addKeysToTags(tags: string[], keys: string[]): Promise<void>;

	/**
	 * Retrieves all cache keys associated with a set of tags.
	 * @param tags An array of tag names.
	 * @returns An array of cache keys.
	 */
	getKeysByTags(tags: string[]): Promise<string[]>;
}

/**
 * The contract for the taggable cache interface.
 * This provides a scoped API for tag-specific operations.
 */
export interface ITaggableCache {
	/**
	 * Stores a value in the cache and associates it with the current tags.
	 * @param key The unique key for the cache entry.
	 * @param value The value to store.
	 * @param ttlSeconds The Time-To-Live in seconds.
	 */
	set(key: string, value: any, ttlSeconds?: number): Promise<void>;

	/**
	 * The "remember" helper, but for tagged cache entries.
	 * @param key The unique key for the cache entry.
	 * @param ttlSeconds The Time-To-Live in seconds.
	 * @param resolver A function that returns the value to be cached if it's not already present.
	 */
	remember<T>(key: string, ttlSeconds: number, resolver: () => Promise<T>): Promise<T>;

	/**
	 * Deletes all cache entries associated with the current tags.
	 * This is the primary method for cache invalidation.
	 */
	flush(): Promise<void>;
}

/**
 * The public interface for the main Cache Module.
 * This is the service that application code will interact with.
 */
export interface ICacheModule {
	get<T>(key: string): Promise<T | null>;
	set(key: string, value: any, ttlSeconds?: number): Promise<void>;
	has(key: string): Promise<boolean>;
	forget(key: string): Promise<void>;
	flush(): Promise<void>;

	/**
	 * The "remember" helper method.
	 * Gets an item from the cache. If it doesn't exist, it executes the resolver function,
	 * stores the result in the cache, and then returns the result.
	 *
	 * @param key The unique key for the cache entry.
	 * @param ttlSeconds The Time-To-Live in seconds.
	 * @param resolver An async function that generates the value to be cached.
	 * @returns The resolved value, either from the cache or the resolver.
	 */
	remember<T>(key: string, ttlSeconds: number, resolver: () => Promise<T>): Promise<T>;

	/**
	 * Begins a tagged cache operation.
	 *
	 * @param tags An array of strings to tag the subsequent cache operations with.
	 * @returns An ITaggableCache instance scoped to the provided tags.
	 */
	tags(tags: string[]): ITaggableCache;
}
