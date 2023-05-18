export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				field: { type: 'string' },
				missing: { type: 'string' },
			}
		}
	}
};
