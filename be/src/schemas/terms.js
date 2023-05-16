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
			}
		}
	}
};
