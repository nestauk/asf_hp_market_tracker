import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms_Stats = async (request, reply) => {
	const {
		field1,
		field2,
		size1 = maxBuckets,
		missing1 = null,
		use_extended_stats = false
	} = request.query;

	const statQuery = use_extended_stats ? 'extended_stats' : 'stats';

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
