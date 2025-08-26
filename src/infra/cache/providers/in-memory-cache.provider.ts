import { AbstractCacheProvider } from '@/infra/cache/abstract-cache-provider';

/**
 * An in-memory cache provider for development and testing.
 * It simulates the behavior of a real cache provider using native Map objects.
 * It is not suitable for production or multi-process environments.
 */
export class InMemoryCacheProvider extends AbstractCacheProvider {
	private readonly store: Map<string, any> = new Map();
	private readonly tagStore: Map<string, Set<string>> = new Map(); // tag -> Set<key>

	constructor() {
		super();
	}

	async get<T>(key: string): Promise<T | null> {
		return this.store.get(key) ?? null;
	}

	async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
		this.store.set(key, value);
		if (ttlSeconds) {
			setTimeout(() => this.store.delete(key), ttlSeconds * 1000);
		}
	}

	async forget(key: string): Promise<void> {
		this.store.delete(key);
	}

	async flush(): Promise<void> {
		this.store.clear();
		this.tagStore.clear();
	}

	// --- Tag-specific logic simulation ---

	async addKeysToTags(tags: string[], keys: string[]): Promise<void> {
		for (const tag of tags) {
			if (!this.tagStore.has(tag)) {
				this.tagStore.set(tag, new Set());
			}
			const tagSet = this.tagStore.get(tag)!;
			for (const key of keys) {
				tagSet.add(key);
			}
		}
	}

	async getKeysByTags(tags: string[]): Promise<string[]> {
		const allKeys = new Set<string>();
		for (const tag of tags) {
			const tagSet = this.tagStore.get(tag);
			if (tagSet) {
				tagSet.forEach((key) => allKeys.add(key));
			}
		}
		return Array.from(allKeys);
	}
}
