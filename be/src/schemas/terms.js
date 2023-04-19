import { maxBuckets } from '../conf.js'

export const schema = {
	schema: {
		querystring: {
			type: 'object',
			required: ['field'],
			properties: {
				field: { type: 'string' },
				size: {
					type: 'number',
					minimum: 1,
					maximum: maxBuckets
				},
				missing: { type: 'string' }
			}
		}
	}
}
