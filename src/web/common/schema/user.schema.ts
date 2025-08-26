import type { JSONSchema } from 'json-schema-to-ts';

export const UserSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },

		firstName: { type: 'string' },
		lastName: { type: 'string' },
		email: { type: 'string', format: 'email' },
		phone: { type: 'string' },

		isActive: { type: 'boolean', default: true },
		lastLoginAt: { type: ['string', 'null'], format: 'date-time' },
		lastSeenAt: { type: ['string', 'null'], format: 'date-time' },
	},
	required: ['id', 'createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'phone'],
} as const satisfies JSONSchema;
