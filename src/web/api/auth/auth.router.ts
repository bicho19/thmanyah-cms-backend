import type { FastifyInstance } from 'fastify';
import type { Routes } from '@/common/interfaces/routes.interface';
import { UserLoginContract } from '@/web/api/auth/api-contract/user-login.contract';
import AuthController from '@/web/api/auth/auth.controller';

class AuthRoute implements Routes {
	public path = '/auth';

	public authController = new AuthController();

	public async initializeRoutes(fastify: FastifyInstance) {
		// user login endpoint
		fastify.route({
			method: 'post',
			url: `${this.path}/login`,
			schema: UserLoginContract,
			handler: this.authController.userLoginHandler,
		});
	}
}

export default AuthRoute;
