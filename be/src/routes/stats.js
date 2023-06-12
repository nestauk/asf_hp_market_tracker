import { index } from '../conf.js';
import { client } from '../es.js';

export const getStats = async (request, reply) => {
	const {
		field,
		use_extended_stats = false,
	} = request.query;

	const statQuery = use_extended_stats ? 'extended_stats' : 'stats';

	const body = {
		size: 0,
		aggs: {
			stats: {
				[statQuery]: {
					field: field,
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