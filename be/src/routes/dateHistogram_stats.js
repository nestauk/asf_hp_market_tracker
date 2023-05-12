import { index } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram_stats = async (request, reply) => {
	const {
		field1,
		field2,
		calendar_interval,
		missing1 = null,
		use_extended_stats = false
	} = request.query;

	const statQuery = use_extended_stats ? 'extended_stats' : 'stats';

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
