import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms = async (request, reply) => {
	const {
		field,
		size = maxBuckets,
		missing = null
	} = request.query;

	const q = {
		size: 0,
		aggs: {
			agg1: {
				terms: {
					field,
					size,
					...missing && { missing }
				}
			}
		}
	};

	const result = await client.search({
		index,
		body: q
	});

	reply.send(result.aggregations);
};
