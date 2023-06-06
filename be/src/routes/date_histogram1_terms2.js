import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram1Terms2 = async (request, reply) => {
	const {
		calendar_interval1 = '1y',
		field1,
		field2,
		missing2 = null,
		size2 = maxBuckets,
		use_extended_stats2 = false,
		with_percentiles2 = false,
		with_stats2 = false,
	} = request.query;

	const stats_type2 = use_extended_stats2 ? 'extended_stats_bucket' : 'stats_bucket';

	const body = {
		size: 0,
		aggs: {
			agg1: {
				date_histogram: {
					field: field1,
					calendar_interval: calendar_interval1,
					format: 'yyyy-MM'
				},
				aggs: {
					agg2: {
						terms: {
							field: field2,
							size: size2,
							...missing2 && { missing: missing2 }
						}
					},
					...with_stats2 && {
						stats2: {
							[stats_type2]: {
								buckets_path: 'agg2>_count'
							}
						}
					},
					...with_percentiles2 && {
						percentiles2: {
							percentiles_bucket: {
								buckets_path: 'agg2>_count'
							}
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
