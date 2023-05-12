export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2', 'calendar_interval'],
			properties: {
				field1: { type: 'string' },
				field2: { type: 'string' },
				calendar_interval: {
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
				missing1: {
					type: 'string',
					pattern: '^\\d{4}-\\d{2}$'
				},
				use_extended_stats: { type: 'boolean' }
			}
		}
	}
};
