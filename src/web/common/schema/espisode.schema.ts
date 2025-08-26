import { ProgramSchema } from '@/web/common/schema/program.schema';

export const EpisodeSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
		title: { type: 'string' },
		description: { type: 'string' },
		shortDescription: { type: ['string', 'null'] },

		// program can be string (id) OR object
		program: {
			anyOf: [
				{ type: 'string' }, // just program id
				ProgramSchema, // full object
			],
		},

		episodeNumber: { type: 'integer', minimum: 1 },
		seasonNumber: { type: ['integer', 'null'], minimum: 1 },

		status: {
			type: 'string',
			enum: ['draft', 'review', 'scheduled', 'published', 'archived', 'deleted'],
		},

		slug: { type: 'string' },
		tags: { type: 'array', items: { type: 'string' } },

		publishDate: { type: ['string', 'null'], format: 'date-time' },
		scheduledPublishAt: { type: ['string', 'null'], format: 'date-time' },

		showNotes: { type: 'array', items: { type: 'string' } },

		thumbnailUrl: { type: ['string', 'null'], format: 'uri' },

		viewCount: { type: 'integer', minimum: 0 },
		likeCount: { type: 'integer', minimum: 0 },
		shareCount: { type: 'integer', minimum: 0 },

		rating: { type: 'number', minimum: 0 },
		ratingCount: { type: 'integer', minimum: 0 },
	},
	required: [
		'id',
		'createdAt',
		'updatedAt',
		'title',
		'description',
		'program',
		'episodeNumber',
		'status',
		'slug',
		'tags',
		'viewCount',
		'likeCount',
		'shareCount',
		'rating',
		'ratingCount',
	],
	additionalProperties: false,
};
