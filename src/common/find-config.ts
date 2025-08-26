import type { FindOptions } from '@mikro-orm/core';

/**
 * Generic query-helper for MikroORM.
 *
 * T —— your entity’s TS type
 */
export interface FindConfig<T> {
	/**
	 * Select/Return only these columns.
	 * Equivalent to MikroORM `fields`.
	 */
	readonly fields?: ReadonlyArray<(keyof T & string) | string>;

	/** How many records to skip (alias “offset”) */
	skip?: number;

	/** How many records to take (alias “limit”) */
	take?: number;

	/**
	 * Order by property → 'asc' | 'desc'
	 */
	order?: { [P in keyof T]?: 'asc' | 'desc' } & Record<string, 'asc' | 'desc'>;

	/**
	 * Relations to populate.
	 * You may pass strings (`"profile.address"`) or
	 * real PopulateHint objects.
	 */
	populate?: string[];

	/**
	 * Any MikroORM-specific extra you need (timeout, cache …)
	 */
	options?: Omit<FindOptions<T, never>, 'where' | 'offset' | 'limit' | 'orderBy' | 'populate' | 'fields'>;
}
