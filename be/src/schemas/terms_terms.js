import { maxBuckets } from '../conf.js'

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field1', 'field2'],
			properties: {
				field1: { type: 'string' },
				field2: { type: 'string' },
				size1: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
				size2: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
				missing1: { type: 'string' },
				missing2: { type: 'string' }
			}
		}
	}
};
