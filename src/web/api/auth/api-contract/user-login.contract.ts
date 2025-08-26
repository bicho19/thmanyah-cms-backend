import type { FastifySchema } from 'fastify';
import type { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';
import { UserSchema } from '@/web/common/schema/user.schema';

export const UserLoginSchema = {
	type: 'object',
	required: ['email', 'password'],
	properties: {
		email: { type: 'string' },
		password: { type: 'string' },
	},
} as const satisfies JSONSchema;

export type UserLoginBody = FromSchema<typeof UserLoginSchema>;

export const UserLoginContract: FastifySchema = {
	description: 'Login user',
	summary: 'Login user',
	tags: ['Auth'],
	body: UserLoginSchema,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
				data: {
					type: 'object',
					properties: {
						token: { type: 'string' },
						user: UserSchema,
					},
				},
			},
		},
		400: {
			description: 'Bad request (Validation failed)',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
