import { DefaultLogger, type LogContext, type LoggerNamespace } from '@mikro-orm/core';
import { ContainerInfraKeys } from '@/infra/constants';
import { asyncContext } from '@/lib/async-context';
import type { AppLogger } from '@/types/common';

export class DatabaseLogger extends DefaultLogger {
	/**
	 * Formats a value for safe insertion into a SQL query string.
	 * Handles strings, numbers, booleans, nulls, Dates, and arrays.
	 * @param val The value to escape.
	 */
	private escapeSqlValue(val: unknown): string {
		if (val === null || val === undefined) {
			return 'NULL';
		}

		if (typeof val === 'boolean') {
			return val ? 'TRUE' : 'FALSE';
		}

		if (typeof val === 'number') {
			return String(val);
		}

		if (val instanceof Date) {
			// Formats to 'YYYY-MM-DD HH:MI:SS.MS' which is standard for SQL
			return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
		}

		if (Array.isArray(val)) {
			// Formats for SQL 'IN' clause: (val1, val2, ...)
			return `(${val.map((v) => this.escapeSqlValue(v)).join(', ')})`;
		}

		if (typeof val === 'string') {
			// The most critical part: escape single quotes by doubling them up.
			return `'${val.replace(/'/g, "''")}'`;
		}

		// Fallback for other types (like objects)
		return `'${String(val)}'`;
	}

	/**
	 * Replaces placeholders ($1, $2) in a query with their escaped values.
	 * This is a robust, dependency-free implementation.
	 * @param queryString The parameterized query (e.g., "... WHERE id = $1").
	 * @param params The array of parameters.
	 */
	private normalizeQuery(queryString: string, params: readonly unknown[] | undefined): string {
		const normalizedQuery = queryString?.replace(/\\"/g, '"').replace(/"/g, '');
		if (!params || params.length === 0) {
			return queryString;
		}

		return normalizedQuery.replace(/\$(\d+)/g, (match, digit) => {
			const index = Number.parseInt(digit, 10) - 1;
			if (index < params.length) {
				return this.escapeSqlValue(params[index]);
			}
			// If a placeholder exists without a matching param, leave it as is.
			return match;
		});
	}

	// This method is called by MikroORM for prettified query logging.
	// It's perfect for structured logging.
	logQuery(context: LogContext): void {
		// // We only care about queries, so let's check the namespace.
		// if (!this.isEnabled('query')) {
		// 	return;
		// }

		// This is the magic. `getStore()` will return the data for the current
		// async context (i.e., the current request).
		const store = asyncContext.getStore();

		//  Use our new, robust formatter to get the executable query string.
		const normalizedQuery = this.normalizeQuery(context.query || '', context.params);

		const logPayload = {
			mikroOrmNamespace: 'query',
			query: normalizedQuery,
			params: context.params,
			took: context.took,
			context: context.connection,
			// You can add more context if needed, e.g., context.connection.name
		};

		if (store?.container) {
			// If we are in a request context, resolve the request-scoped logger.
			// This logger instance already has the correlationId!
			const logger = store.container.resolve<AppLogger>(ContainerInfraKeys.LOGGER).child({ name: 'database-logger' });

			// The logger will automatically add the correlationId to the log entry.
			logger.info(logPayload, 'Database Query');
		} else {
			// Fallback for operations outside a request (e.g., migrations, CLI tasks).
			// It won't have a correlationId, which is expected.
			console.log(`[MikroORM-query] ${context.query} [took ${context.took} ms]`);
		}
	}

	// You can also implement the generic `log` method for other namespaces like 'info' or 'error'
	log(namespace: LoggerNamespace, message: string, context: LogContext): void {
		if (!this.isEnabled(namespace) || namespace === 'query') {
			return; // 'query' is handled by logQuery
		}

		const store = asyncContext.getStore();
		if (store?.container) {
			const logger = store.container.resolve<AppLogger>(ContainerInfraKeys.LOGGER).child({ name: 'database-logger' });
			logger.info({ mikroOrmNamespace: namespace }, message);
		} else {
			console.log(`[MikroORM-${namespace}] ${message}`);
		}
	}
}
