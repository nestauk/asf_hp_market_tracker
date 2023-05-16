import { index } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getDateHistogram1Histogram2 = async (request, reply) => {
	const {
		calendar_interval1 = '1y',
		field1,
		bins2 = 10,
		field2,
	} = request.query;

	const interval = await getIntervalForBins(index, field2, bins2);
	request.meta = { interval2: interval };

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
