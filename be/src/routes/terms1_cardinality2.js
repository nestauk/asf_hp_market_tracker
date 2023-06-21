import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms1Cardinality2 = async (request, reply) => {
	const {
		field1,
		missing1 = null,
		size1 = maxBuckets,
		field2,
		missing2 = null,
		use_extended_stats2 = false,
		with_percentiles2 = false,
		with_stats2 = false,
	} = request.query;

	const stats_type2 = use_extended_stats2 ? 'extended_stats_bucket' : 'stats_bucket';

	const body = {
		size: 0,
		aggs: {
			terms: {
				terms: {
					field: field1,
					size: size1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					cardinality: {
						cardinality: {
							field: field2,
							...missing2 && { missing: missing2 }
						}
					},
				}
			},
			...with_stats2 && {
				stats: {
					[stats_type2]: {
						buckets_path: 'terms>cardinality'
					}
				}
			},
			...with_percentiles2 && {
				percentiles: {
					percentiles_bucket: {
						buckets_path: 'terms>cardinality'
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
