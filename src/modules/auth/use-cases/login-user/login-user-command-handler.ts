import jwt from 'jsonwebtoken';
import { ContainerInfraKeys, ContainerServicesKeys } from '@/infra/constants';
import type { CommandHandler } from '@/lib/cqrs/command-handler';
import type UserService from '@/modules/auth/services/user.service';
import type { UserAuthTokenPayload } from '@/modules/auth/types/auth.types';
import type {
	LoginUserCommand,
	LoginUserCommandResponse,
} from '@/modules/auth/use-cases/login-user/login-user-command.types';
import type { ConfigModule } from '@/types/config-module';

type CommandHandlerProps = {
	[ContainerInfraKeys.CONFIG_MODULE]: ConfigModule;
	[ContainerServicesKeys.USERS]: UserService;
};

class LoginUserCommandHandler implements CommandHandler<LoginUserCommand, LoginUserCommandResponse> {
	private readonly userService: UserService;
	private readonly configModule: ConfigModule;

	constructor({ userService, configModule }: CommandHandlerProps) {
		this.userService = userService;
		this.configModule = configModule;
	}

	async execute({ email, password }: LoginUserCommand): Promise<LoginUserCommandResponse> {
		const {
			baseConfig: { jwt_secret },
		} = this.configModule;

		const user = await this.userService.authenticateUser({ email: email, password: password });

		// Create jwt token to send back
		const tokenPayload: UserAuthTokenPayload = {
			id: user.id,
			type: 'user',
		};

		const token = jwt.sign(tokenPayload, jwt_secret, {
			expiresIn: '6d',
		});

		return {
			token: token,
			user: user,
		};
	}
}

export default LoginUserCommandHandler;
