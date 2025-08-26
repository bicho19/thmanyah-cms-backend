import 'reflect-metadata';
import appLogger from '@/infra/logger/logger';
import { buildApp } from './build-app';

const start = async () => {
	const logger = appLogger;
	logger.info('Starting API server process...');
	const server = await buildApp();

	// The builder already called .init() and .ready(), so we just listen
	try {
		// We get the port from the app instance itself now
		const port = server.config.PORT || 3001;
		await server.listen({ port: port, host: '0.0.0.0' });
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

void start();
