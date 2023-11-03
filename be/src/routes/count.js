import { index } from '../conf.js';
import { client, isOpenSearch } from '../es.js';

export const getCount = async (request, reply) => {

	const body = {
		...request.filter,
	};
	let result = await client.count({
		body,
		index
	});

	reply.send(isOpenSearch ? result.body : result);
};
