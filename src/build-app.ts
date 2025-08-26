import 'reflect-metadata';
import { getCurrentDirName } from '@utils/current-dir-name';
import type { FastifyInstance } from 'fastify';
import { env } from '@/config/env';
import appLogger from '@/infra/logger/logger';
import loadCore from '@/loaders/core-loader';
import App from './app';

// This function will be our single source of truth for creating the app
export async function buildApp(): Promise<FastifyInstance> {
	// Run all loaders to set up the DI container, database, etc.
	const container = await loadCore({
		rootDirectory: getCurrentDirName(import.meta.url),
		logger: appLogger,
		isWorker: false,
	});

	// Create the Fastify app instance
	const appInstance = new App();

	// IMPORTANT: Attach the container to the Fastify instance
	const server = appInstance.getInstance();
	server.container = container;

	// Add the config to the server
	server.decorate('config', env);

	// Initialize plugins, routes, etc.
	await appInstance.init();

	// Make sure all plugins are ready
	await server.ready();

	// Return the fully configured server instance
	return server;
}
