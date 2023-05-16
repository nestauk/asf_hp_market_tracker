import rison from 'rison';

import { minDocCount } from './conf.js';
import { getDocumentCount } from './es.js';
import { makeQuery } from './filter.js';

export const onRequest = async (request, reply) => {
	const { filter = null } = request.query;

	request.filter = filter
		? makeQuery(rison.decode(filter))
		: { query: { match_all: {} } };

	reply.noData = false;
	if (filter) {
		const count = await getDocumentCount(request.filter);
		if (count === 0) {
			reply.noData = true;
			reply.send({
				code: 100,
				message: 'no documents found for given filter'
			});
			return reply;
		}
		if (count < minDocCount) {
			reply.noData = true;
			reply.send({
				code: 101,
				data: { count },
				message: 'minDocCount threshold exceeded',
			});
			return reply; // mandatory, so the request is not executed further
		}
	}
};

export const formatPayload = async (request, reply, payload) => {
	return reply.noData
		? payload
		: {
			code: 200,
			data: payload,
			message: 'aggregation successful',
			...request.meta && { meta: request.meta }
		};
};
