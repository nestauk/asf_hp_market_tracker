import { index } from '../conf.js';
import { client } from '../es.js';

export const getCardinality = async (request, reply) => {
	const {
		field,
		missing = null,
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			cardinality: {
				cardinality: {
					field,
					...missing && { missing }
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
