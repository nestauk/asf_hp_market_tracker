
export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				// 1
				field: { type: 'string' },
                use_extended_stats: {
                    type: 'boolean',
                    default: false
                }
			}
		}
	}
};
