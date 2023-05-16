import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms1Stats2 = async (request, reply) => {
	const {
		field1,
		missing1 = null,
		size1 = maxBuckets,
		field2,
		use_extended_stats2 = false,
	} = request.query;

	const statQuery = use_extended_stats2 ? 'extended_stats' : 'stats';

	const body = {
		size: 0,
		aggs: {
			agg1: {
				terms: {
					field: field1,
					size: size1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					agg2: {
						[statQuery]: {
							field: field2,
						}
					}
				}
			}
		}
	};

	const result = await client.search({
		body,
		index
	});

	reply.send(result.aggregations);
};