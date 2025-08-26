import { wrap } from '@mikro-orm/core';
// @ts-ignore
import Scrypt from 'scrypt-kdf';
import type { FindConfig } from '@/common/find-config';
import { BaseService } from '@/common/services/base-service';
import { isDefined } from '@/core/utils/common/is-defined';
import { ContainerInfraKeys, ContainerRepositoriesKeys } from '@/infra/constants';
import type { AbstractEventBus } from '@/infra/event-bus/abstract-event-bus';
import AppError from '@/lib/exceptions/errors';
import type User from '@/modules/auth/entities/user.entity';
import type UserRepository from '@/modules/auth/repositories/user.repository';
import type { AuthenticateUserInput } from '@/modules/auth/types/auth.types';
import type { UserDTO } from '@/modules/auth/types/user.type';
import type { AppLogger } from '@/types/common';

type InjectedDependencies = {
	[ContainerInfraKeys.LOGGER]: AppLogger;
	[ContainerInfraKeys.EVENT_BUS]: AbstractEventBus;
	[ContainerRepositoriesKeys.USERS]: UserRepository;
};

class UserService extends BaseService<User> {
	protected readonly logger: AppLogger;
	protected readonly userRepository: UserRepository;
	protected readonly _eventBus: AbstractEventBus;

	constructor({ logger, _event_bus, userRepository }: InjectedDependencies) {
		super();
		this.logger = logger;
		this.userRepository = userRepository;
		this._eventBus = _event_bus;
	}

	/**
	 * Verifies if a password is valid given the provided password hash
	 * @param {string} password - the raw password to check
	 * @param {string} hash - the hash to compare against
	 * @return {boolean} the result of the comparison
	 */
	protected async comparePassword_(password: string, hash: string): Promise<boolean> {
		const buf = Buffer.from(hash, 'base64');
		return Scrypt.verify(buf, password);
	}

	/**
	 * Authenticates a given user based on an email, password combination. Uses
	 * scrypt to match password with hashed value.
	 * @return {Promise<UserDTO>} the authenticated user
	 */
	async authenticateUser(payload: AuthenticateUserInput): Promise<UserDTO> {
		const userWithHash = await this.userRepository.findOne({
			email: payload.email,
		});

		if (!userWithHash || !userWithHash.passwordHash) {
			throw new AppError(AppError.Types.NOT_FOUND, 'Invalid email or password');
		}

		const passwordsMatch = await this.comparePassword_(payload.password, userWithHash.passwordHash);

		if (!passwordsMatch) {
			throw new AppError(AppError.Types.NOT_FOUND, 'Invalid phone or password');
		}

		// Convert to safe DTO before returning
		const { passwordHash, ...safeUser } = userWithHash.toPOJO();
		return safeUser;
	}

	async retrieve(userId: string, config: FindConfig<User> = {}): Promise<UserDTO | null> {
		if (!isDefined(userId)) {
			throw new AppError(AppError.Types.NOT_FOUND, `"userId" must be defined`);
		}

		const opts = this.toFindOptions(config);
		const user = await this.userRepository.findOne({ id: userId }, opts);

		if (!user) {
			return null;
		}

		return wrap(user).toJSON();
	}
}

export default UserService;
