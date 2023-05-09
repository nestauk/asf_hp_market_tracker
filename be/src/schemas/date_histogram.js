export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field', 'calendar_interval'],
			properties: {
				field: { type: 'string' },
				calendar_interval: {
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
				missing: {
					type: 'string',
					pattern: '^\\d{4}-\\d{2}$'
				}
			}
		}
	}
};
