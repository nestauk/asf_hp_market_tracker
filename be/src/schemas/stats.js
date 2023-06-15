
export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				field: { type: 'string' },
				use_extended_stats: {
					type: 'boolean',
					default: false
				}
			}
		}
	}
};
