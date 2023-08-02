import rison from 'rison';

import { minDocCount } from './conf.js';
import { getDocumentCount } from './es.js';
import { makeQuery } from './filter.js';

// eslint-disable-next-line consistent-return
export const onRequest = async (request, reply) => {
	const { filter = null } = request.query;

	request.filter = filter
		? makeQuery(rison.decode(filter))
		: { query: { match_all: {} } };

	request.originalFilter = filter ? rison.decode(filter) : {};

	reply.noData = false;
	if (filter) {
		const count = await getDocumentCount(request.filter);
		if (count === 0) {
			reply.noData = true;
			reply.send({
				code: 100,
				message: 'No documents found for given filter'
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
			message: 'Aggregation successful',
			request: {
				agg: {
					id: request.routerPath.slice(1),
					params: request.query
				},
				filter: request.filter
			},
			...request.meta && { meta: request.meta }
		};
};
