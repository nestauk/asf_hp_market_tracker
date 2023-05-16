export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				calendar_interval: {
					default: '1y',
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
				field: { type: 'string' },
			}
		}
	}
};
