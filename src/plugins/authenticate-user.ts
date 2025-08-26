import type { FastifyInstance, FastifyRequest } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import jwt from 'jsonwebtoken';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import AppError from '@/lib/exceptions/errors';
import type UserService from '@/modules/auth/services/user.service';
import type { UserAuthTokenPayload } from '@/modules/auth/types/auth.types';
import type { ConfigModule } from '@/types/config-module';

export const authenticateUser = fastifyPlugin((fastify: FastifyInstance, _: unknown, done: () => void) => {
	const authPreHandler = async (request: FastifyRequest) => {
		const authorization = request.headers.authorization?.split('Bearer ')[1];

		if (!authorization || authorization.length === 0) {
			throw new AppError(AppError.Types.UNAUTHORIZED, 'No authorization token was found. Please provide one');
		}

		const { baseConfig } = request.server.container.resolve<ConfigModule>(ContainerInfraKeys.CONFIG_MODULE);

		const payload: UserAuthTokenPayload = jwt.verify(authorization, baseConfig.jwt_secret) as UserAuthTokenPayload;

		const userService = request.server.container.resolve<UserService>(ContainerServicesKeys.USERS);
		const user = await userService.retrieve(payload.id, {
			fields: ['id', 'firstName', 'lastName', 'email', 'phone'],
		});
		if (!user) {
			throw new AppError(AppError.Types.UNAUTHORIZED, 'You are not authorized to perform this action');
		}

		request.user = {
			id: user.id,
			first_name: user.firstName,
			last_name: user.firstName,
			email: user.email,
			phone: user.phone,
		};
	};
	fastify.decorate('authenticateUser', authPreHandler);
	done();
});
