import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms = async (request, reply) => {
	const {
		field,
		missing = null,
		size = maxBuckets,
		use_extended_stats = false,
		with_percentiles = false,
		with_stats = false,
	} = request.query;

	const stats_type = use_extended_stats ? 'extended_stats_bucket' : 'stats_bucket';

	const body = {
		size: 0,
		aggs: {
			agg1: {
				terms: {
					field,
					size,
					...missing && { missing }
				}
			},
			...with_stats && {
				stats: {
					[stats_type]: {
						buckets_path: 'agg1>_count'
					}
				}
			},
			...with_percentiles && {
				percentiles: {
					percentiles_bucket: {
						buckets_path: 'agg1>_count'
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
