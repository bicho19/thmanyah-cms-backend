import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getCurrentDirName } from '@utils/current-dir-name';
import glob from 'fast-glob';
import type { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import type { Routes } from '@/common/interfaces/routes.interface';

export const initializeApiRoutes: FastifyPluginAsync<FastifyPluginOptions> = async (server, options) => {
	const routesPath = '../web/api/**/*.router.ts';
	const routesFull = path.join(getCurrentDirName(import.meta.url), routesPath);
	const files = glob.globSync(routesFull).filter((f) => !f.endsWith('redirect.router.ts'));

	const routes: Routes[] = [];

	for (const file of files) {
		const module = await import(pathToFileURL(file).href);
		const loaded = module.default ?? module;
		routes.push(new loaded());
	}

	for (const route of routes) {
		await route.initializeRoutes(server);
	}
};
