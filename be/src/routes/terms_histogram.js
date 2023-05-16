import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getTerms_Histogram = async (request, reply) => {
	const {
		field1,
		field2,
		size1 = maxBuckets,
		bins,
		missing1 = null,
		missing2 = null
	} = request.query;

	const interval = await getIntervalForBins(index, field2, bins);
	request.meta = { interval2: interval };

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
						histogram: {
							field: field2,
							interval,
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
