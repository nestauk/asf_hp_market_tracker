export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2'],
			properties: {
				// 1
				calendar_interval1: {
					default: '1y',
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
				field1: { type: 'string' },
				// 2
				field2: { type: 'string' },
				use_extended_stats2: {
					default: false,
					type: 'boolean'
				},
				use_percentiles2: {
					default: false,
					type: 'boolean'
				}
			}
		}
	}
};
