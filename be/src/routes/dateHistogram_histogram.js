import { index } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getDateHistogram_histogram = async (request, reply) => {
	const {
		field1,
		field2,
		calendar_interval,
		bins,
		missing1 = null,
	} = request.query;

	const interval = await getIntervalForBins(index, field2, bins);

	const body = {
		size: 0,
		aggs: {
			agg1: {
				date_histogram: {
					field: field1,
					calendar_interval,
					...missing1 && { missing: missing1 },
					format: 'yyyy-MM'
				},
				aggs: {
					agg2: {
						histogram: {
							field: field2,
							interval,
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
