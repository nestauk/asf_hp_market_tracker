import { maxBuckets, maxBins } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2'],
			properties: {
				// 1
				field1: { type: 'string' },
				size1: {
					default: maxBuckets,
					type: 'integer',
					minimum: 1,
					maximum: maxBuckets
				},
				// 2
				bins2: {
					default: 10,
					type: 'integer',
					minimum: 1,
					maximum: maxBins
				},
				field2: { type: 'string' },
			}
		}
	}
};
