import { index } from '../conf.js';
import { client } from '../es.js';

export const getCount = async (request, reply) => {

	const body = {
		...request.filter,
	};
	const result = await client.count({
		body,
		index
	});

	reply.send(result);
};
