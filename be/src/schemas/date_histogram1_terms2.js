import { maxBuckets } from '../conf.js';

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
				missing2: { type: 'string' },
				size2: {
					type: 'integer',
					minimum: 1,
					maximum: maxBuckets
				},
				use_extended_stats2: {
					default: false,
					type: 'boolean'
				},
				with_percentiles2: {
					default: false,
					type: 'boolean'
				},
				with_stats2: {
					default: false,
					type: 'boolean'
				},
			}
		}
	}
};
