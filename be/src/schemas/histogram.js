import { maxBins } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field', 'bins'],
			properties: {
				field: { type: 'string' },
				bins: {
					type: 'number',
					minimum: 1,
					maximum: maxBins
				},
				missing: { type: 'number' }
			}
		}
	}
};
