import type { FromSchema } from 'json-schema-to-ts';
import { serverErrorResponseSchema } from '@/web/common/schema/errors/server-error.schema';
import { validationErrorResponseSchema } from '@/web/common/schema/errors/validation-error-schema';

export const UpdateEpisodeSchema = {
	type: 'object',
	properties: {
		title: { type: 'string' },
		description: { type: 'string' },
		slug: { type: 'string' },
		programId: { type: 'string' },
		episodeNumber: { type: 'number' },
		duration: { type: 'number' },
		tags: { type: 'array', items: { type: 'string' } },
		showNotes: { type: 'array', items: { type: 'string' } },
		shortDescription: { type: 'string' },
		seasonNumber: { type: 'number' },
		thumbnailUrl: { type: 'string' },
	},
	required: [],
	additionalProperties: false,
} as const;

export const UpdateEpisodeParams = {
	type: 'object',
	properties: {
		id: { type: 'string' },
	},
	required: ['id'],
	additionalProperties: false,
} as const;

export type UpdateEpisodeBody = FromSchema<typeof UpdateEpisodeSchema>;
export type UpdateEpisodeParams = FromSchema<typeof UpdateEpisodeParams>;

export const UpdateEpisodeContract = {
	summary: 'Update an episode',
	description: 'Update an episode',
	tags: ['Episodes'],
	body: UpdateEpisodeSchema,
	params: UpdateEpisodeParams,
	response: {
		200: {
			description: 'Successful response',
			type: 'object',
			properties: {
				message: { type: 'string' },
			},
		},
		400: {
			description: 'Bad request (Validation error)',
			...validationErrorResponseSchema,
		},
		404: {
			description: 'Episode Not found',
			...validationErrorResponseSchema,
		},
		500: {
			description: 'Internal server error',
			...serverErrorResponseSchema,
		},
	},
};
