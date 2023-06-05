import { index } from '../conf.js';
import { client } from '../es.js';

export const getCount = async (request, reply) => {

	const result = await client.count({
		index
	});

	reply.send(result);
};
