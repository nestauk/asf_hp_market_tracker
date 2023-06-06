import { index } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram = async (request, reply) => {
	const {
		calendar_interval = '1y',
		field,
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			date_histogram: {
				date_histogram: {
					field,
					calendar_interval,
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
