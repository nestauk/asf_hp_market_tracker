import { maxBuckets } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				field: { type: 'string' },
				missing: { type: 'string' },
				size: {
					default: maxBuckets,
					type: 'integer',
					minimum: 1,
					maximum: maxBuckets
				},
				use_extended_stats: {
					default: false,
					type: 'boolean'
				},
				with_stats: {
					default: false,
					type: 'boolean'
				},
			}
		}
	}
};
