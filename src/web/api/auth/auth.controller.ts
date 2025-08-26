import type { FastifyReply, FastifyRequest } from 'fastify';
import type LoginUserCommandHandler from '@/modules/auth/use-cases/login-user/login-user-command-handler';
import type { UserLoginBody } from '@/web/api/auth/api-contract/user-login.contract';

class AuthController {
	public userLoginHandler = async (request: FastifyRequest<{ Body: UserLoginBody }>, reply: FastifyReply) => {
		const handler = request.container.resolve<LoginUserCommandHandler>('auth.loginUserCommandHandler');
		const response = await handler.execute({
			email: request.body.email,
			password: request.body.password,
		});
		return reply.send({
			message: 'user logged in successfully',
			data: response,
		});
	};
}

export default AuthController;
