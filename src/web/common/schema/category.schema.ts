export const CategorySchema = {
	type: 'object',
	properties: {
		id: { type: 'string' },
		name: { type: 'string' },
		slug: { type: 'string' },
		description: { type: ['string', 'null'] },
		iconUrl: { type: ['string', 'null'], format: 'uri' },
		color: { type: ['string', 'null'] },
		sortOrder: { type: 'integer' },
		isActive: { type: 'boolean' },
		createdAt: { type: 'string', format: 'date-time' },
		updatedAt: { type: 'string', format: 'date-time' },
	},
	required: ['id', 'createdAt', 'updatedAt', 'name', 'slug', 'sortOrder', 'isActive'],
	additionalProperties: false,
};
