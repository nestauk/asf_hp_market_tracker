import { index } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram1Stats2 = async (request, reply) => {
	const {
		calendar_interval1 = '1y',
		field1,
		field2,
		use_extended_stats2 = false
	} = request.query;

	const statQuery = use_extended_stats2 ? 'extended_stats' : 'stats';

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
						[statQuery]: {
							field: field2,
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
