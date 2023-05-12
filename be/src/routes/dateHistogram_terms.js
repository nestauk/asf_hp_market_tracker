import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram_terms = async (request, reply) => {
	const {
		field1,
		field2,
		calendar_interval1,
		size2 = maxBuckets,
		missing1 = null,
		missing2 = null
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			agg1: {
				date_histogram: {
					field: field1,
					calendar_interval: calendar_interval1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					agg2: {
						terms: {
							field: field2,
							size: size2,
							...missing2 && { missing: missing2 }
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
