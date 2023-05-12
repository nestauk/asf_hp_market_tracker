import { maxBuckets } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'calendar_interval1', 'field2'],
			properties: {
				field1: { type: 'string' },
				field2: { type: 'string' },
				calendar_interval1: {
					type: 'string',
					enum: ['1M', '1q', '1y']
				},
				missing1: {
					type: 'string',
					pattern: '^\\d{4}-\\d{2}$'
				},
				missing2: { type: 'string' },
				size2: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
			}
		}
	}
};
