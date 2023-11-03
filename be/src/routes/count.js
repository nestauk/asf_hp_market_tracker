import { index } from '../conf.js';
import { getXCompatibleCount } from '../es.js';

export const getCount = async (request, reply) => {

	const body = {
		...request.filter,
	};
	let result = await getXCompatibleCount({
		body,
		index
	});

	reply.send(result);
};
