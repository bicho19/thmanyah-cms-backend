import { CategorySchema } from '@/web/common/schema/category.schema';

export const ProgramSchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
		title: { type: 'string' },
		description: { type: 'string' },
		shortDescription: { type: 'string' },
		type: { type: 'string', enum: ['podcast', 'documentary', 'interview'] },
		status: {
			type: 'string',
			enum: ['draft', 'review', 'scheduled', 'published', 'archived', 'deleted'],
		},
		category: {
			anyOf: [
				{ type: 'string' }, // just program id
				CategorySchema, // full object
			],
		},

		tags: { type: 'array', items: { type: 'string' } },
		slug: { type: 'string' },
		thumbnailUrl: { type: ['string', 'null'], format: 'uri' },
		bannerUrl: { type: ['string', 'null'], format: 'uri' },
		totalEpisodes: { type: 'integer', minimum: 0 },
		totalViews: { type: 'integer', minimum: 0 },
		averageRating: { type: 'number', minimum: 0 },
		totalRatings: { type: 'integer', minimum: 0 },
		publishedAt: { type: ['string', 'null'], format: 'date-time' },
		scheduledPublishAt: { type: ['string', 'null'], format: 'date-time' },
	},
	required: [
		'id',
		'createdAt',
		'updatedAt',
		'title',
		'description',
		'shortDescription',
		'type',
		'status',
		'category',
		'tags',
		'slug',
		'totalEpisodes',
		'totalViews',
		'averageRating',
		'totalRatings',
	],
	additionalProperties: false,
};
