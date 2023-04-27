import { index } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram = async (request, reply) => {
	const {
		field,
		calendar_interval,
		missing = null
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			agg1: {
				date_histogram: {
					field,
					calendar_interval,
					...missing && { missing },
					format: 'yyyy-MM'
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
