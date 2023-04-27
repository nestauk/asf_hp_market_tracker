import { index } from '../conf.js';
import { client } from '../es.js';
import { getIntervalForBins } from '../util.js';

export const getHistogram = async (request, reply) => {
	const {
		field,
		bins = null,
		missing = null
	} = request.query;

	const interval = await getIntervalForBins(index, field, bins);

	const q = {
		size: 0,
		aggs: {
			agg1: {
				histogram: {
					field,
					interval,
					...missing && { missing }
				}
			}
		}
	};

	const result = await client.search({
		index,
		body: q
	});

	reply.send(result.aggregations);

};
