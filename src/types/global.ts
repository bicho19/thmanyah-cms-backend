import type { env } from '@/config/env';
import type { AppContainer } from '@/lib/app-container';
import type { AuthenticatedUser } from '@/modules/auth/types/auth.types';

declare module 'fastify' {
	interface FastifyInstance {
		config: typeof env;
		container: AppContainer;
		authenticateUser: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
	}
	interface FastifyRequest {
		container: AppContainer;
		user: AuthenticatedUser;
	}
}
