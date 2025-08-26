import { JSONSchema } from 'json-schema-to-ts';

export const MediaSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
		type: { type: 'string', enum: ['video', 'audio'] },
		url: { type: 'string' },
		source: { type: 'string', enum: ['upload', 'youtube', 'spotify', 'external'] },
		mimeType: { type: ['string', 'null'] },
		qualityLabel: { type: ['string', 'null'] },
		fileSizeBytes: { type: ['number', 'null'] },
		sortOrder: { type: 'number' },
	},
	required: ['id', 'createdAt', 'updatedAt', 'type', 'url', 'source', 'sortOrder'],
} as const satisfies JSONSchema;
