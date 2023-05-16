import { maxBins } from '../conf.js';

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				bins: {
					default: 10,
					type: 'integer',
					minimum: 1,
					maximum: maxBins
				},
				field: { type: 'string' },
			}
		}
	}
};
