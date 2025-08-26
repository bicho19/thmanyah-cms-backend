import { DefaultLogger, type LogContext, type LoggerNamespace } from '@mikro-orm/core';
import appLogger from '@/infra/logger/logger';

function normalizeQuery(query: string) {
	return query.replace(/\s\s+/g, ' ').trim();
}

export class DatabaseLogger extends DefaultLogger {
	logger = appLogger.child({ name: 'database-logger' });
	log(namespace: LoggerNamespace, message: string, context?: LogContext) {
		this.logger.info(`[${namespace}] ${message}`);
	}
}
