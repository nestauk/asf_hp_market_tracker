import { maxBuckets } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2'],
			properties: {
				field1: { type: 'string' },
				field2: { type: 'string' },
				size: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
				missing1: { type: 'string' },
				use_extended_stats: { type: 'boolean' }
			}
		}
	}
};
