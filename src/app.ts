import path from 'node:path';
import fastifyCompress from '@fastify/compress';
import fastifyCors from '@fastify/cors';
import type { FastifyError } from '@fastify/error';
import fastifyFormBody from '@fastify/formbody';
import fastifyHelmet from '@fastify/helmet';
import fastifyStatic from '@fastify/static';
import { authenticateUser } from '@plugins/authenticate-user';
import { initializeApiRoutes } from '@plugins/initialize-api-routes';
import requestScopePlugin from '@plugins/request-scope-plugin';
import { initSwagger } from '@plugins/swagger';
import { getCurrentDirName } from '@utils/current-dir-name';
import { schemaErrorFormatter } from '@utils/schemaErrorFormatter';
import { turboId } from '@utils/turbo-id';
import ajvErrors from 'ajv-errors';
import Fastify, { type FastifyBaseLogger, type FastifyInstance } from 'fastify';
import fastifyPrintRoutes from 'fastify-print-routes';
import { serializeError } from 'serialize-error';
import appLogger from '@/infra/logger/logger';
import AppError from '@/lib/exceptions/errors';

class App {
	public app: FastifyInstance;

	public env: string;

	constructor() {
		this.app = Fastify({
			schemaErrorFormatter,
			ajv: {
				customOptions: {
					coerceTypes: true,
					allErrors: true,
				},
				plugins: [ajvErrors],
			},
			requestIdLogLabel: 'correlationId',
			genReqId(_) {
				return turboId.generate();
			},
			loggerInstance: appLogger as FastifyBaseLogger,
		});
	}

	public getInstance() {
		return this.app;
	}

	public async init() {
		await this.initializePlugins();
		this.initializeRoutes();
		this.initializeErrorHandling();
		this.app.addHook('onSend', async (req, reply) => {
			reply.header('x-correlation-id', req.id);
		});
	}

	private async initializePlugins() {
		this.app.register(fastifyCors, { origin: this.app.config.CORS_ORIGIN });
		this.app.register(fastifyHelmet);
		this.app.register(fastifyCompress);
		this.app.register(fastifyFormBody);
		this.app.register(authenticateUser);
		this.app.register(initSwagger);
		this.app.register(fastifyStatic, {
			root: path.join(getCurrentDirName(import.meta.url), './public'),
			prefix: '/',
		});
		this.app.register(requestScopePlugin);
		this.app.register(fastifyPrintRoutes);
	}

	private initializeRoutes() {
		this.app.register(initializeApiRoutes, { prefix: 'api/v1' });

		// Define the route that serves the OpenAPI specification
		this.app.get('/openapi.json', async (req, reply) => req.server.swagger());
		// Create a dedicated, user-friendly route for your API docs
		this.app.get('/docs', async (req, reply) => {
			// Set the CSP header specifically for this response.
			// This is more reliable than a global 'onSend' hook.
			reply.header(
				'Content-Security-Policy',
				[
					"default-src 'self'",
					// Allow scripts and styles from unpkg.com where Stoplight Elements is hosted.
					"script-src 'self' https://unpkg.com",
					"style-src 'self' https://unpkg.com 'unsafe-inline'", // 'unsafe-inline' is often needed for web components that inject styles.
					// Allow fonts if Elements loads them from a CDN.
					"font-src 'self' https://unpkg.com",
					// Allow fetching the openapi.json spec.
					"connect-src 'self'",
				].join('; '),
			);

			// Serve the docs.html file from the 'public' folder.
			return reply.sendFile('docs.html');
		});
	}

	private initializeErrorHandling() {
		this.app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
			if (error instanceof AppError) {
				return reply.status(error.statusCode).send({
					statusCode: error.statusCode,
					code: error.type,
					message: error.message,
					request_id: request.id,
					details: error.details ?? null,
				});
			}

			if (error.code === 'FST_ERR_VALIDATION') {
				// Send error response
				return reply.status(400).send({
					statusCode: 400,
					code: AppError.Types.VALIDATION_ERROR,
					request_id: request.id,
					message: error.message,
					details: null,
				});
			}

			if (error.name === 'AwilixResolutionError') {
				console.log(error);
				return reply.status(500).send({
					statusCode: 500,
					code: AppError.Types.UNEXPECTED_STATE,
					request_id: request.id,
					message: error.message,
					details: 'Please make sure the requested dependency is available in the DI container',
				});
			}

			if (error.name === 'SyntaxError') {
				return reply.status(400).send({
					statusCode: 400,
					code: AppError.Types.UNEXPECTED_STATE,
					request_id: request.id,
					message: 'Syntax error in request',
					details:
						'Unable to parse the request due to invalid syntax. Please check the request format and data structure.',
				});
			}

			request.log.error({ error: serializeError(error) }, `Error :: [${request.method}] ${request.url}`);

			return reply.status(500).send({
				statusCode: 500,
				code: AppError.Types.SERVER_ERROR,
				request_id: request.id,
				message: 'Something went wrong',
				details: null,
			});
		});
	}
}

export default App;
