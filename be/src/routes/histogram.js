import { index } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getHistogram = async (request, reply) => {
	const {
		bins = 10,
		field,
	} = request.query;

	const interval = await getIntervalForBins(index, field, bins);
	request.meta = { interval };

	const body = {
		size: 0,
		aggs: {
			agg1: {
				histogram: {
					field,
					interval,
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