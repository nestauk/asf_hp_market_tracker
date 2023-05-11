import { maxBuckets, maxBins } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2', 'bins'],
			properties: {
				field1: { type: 'string' },
				field2: { type: 'string' },
				size1: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
				bins: {
					type: 'number',
					minimum: 1,
					maximum: maxBins
				},
				missing1: { type: 'string' },
				missing2: { type: 'number' }
			}
		}
	}
};
