export type UserAuthTokenPayload = {
	id: string;
	type: string;
};

export type AuthenticatedUser = {
	id: string;
	first_name: string;
	last_name: string;
	email: string;
	phone: string;
};

export type AuthenticateUserInput = {
	email: string;
	password: string;
};
