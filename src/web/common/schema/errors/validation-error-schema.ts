import type { JSONSchema } from 'json-schema-to-ts';

// The standard structure for all validation error responses.
export const validationErrorResponseSchema = {
	type: 'object',
	properties: {
		statusCode: { type: 'number' },
		code: { type: 'string' },
		message: { type: 'string' },
		request_id: { type: 'string' },
		details: {
			anyOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }, { type: 'null' }],
		},
	},
	required: ['statusCode', 'code', 'message', 'request_id'],
} as const satisfies JSONSchema;
