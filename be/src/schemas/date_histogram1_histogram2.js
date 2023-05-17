import { maxBins } from '../conf.js';

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
