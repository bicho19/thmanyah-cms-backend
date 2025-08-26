import type { UserDTO } from '@/modules/auth/types/user.type';

export interface LoginUserCommand {
	email: string;
	password: string;
}

export interface LoginUserCommandResponse {
	token: string;
	user: UserDTO;
}
