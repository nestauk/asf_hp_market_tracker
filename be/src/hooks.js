import * as _ from 'lamb';
import rison from 'rison';

import { minDocCount } from './conf.js';
import { makeQuery, makeQueryFromStringsFilters } from './filter.js';
import { calculateCoverage } from './util.js';

// eslint-disable-next-line consistent-return
export const onRequest = async (request, reply) => {

	let { field, field1, field2, filter = null, stringsFilters = null } = request.query;

	/* Special routes where field is not specified */
	switch (request.routeOptions.url) {
		case '/count':
		case '/date_histogram1_certified2':
			field = '_id'; // all fields have _id so only the filter will affect outcomes
			break;
		case '/certified':
			field = 'installer_id_hash';
			break;
		default:
			break;
	}

	let allFilters = [];
	let fieldsInvolved = [];

	if (filter) {
		const decodedFilter = rison.decode(filter);

		fieldsInvolved.push(..._.keys(decodedFilter));
		const filterQuery = makeQuery(decodedFilter);
		allFilters.push(...filterQuery);

		request.originalFilter = decodedFilter;
	} else {
		request.originalFilter = {};
	}

	if (stringsFilters) {
		const decodedStringsFilters = rison.decode(stringsFilters);

		fieldsInvolved.push(..._.flatMap(
			decodedStringsFilters,
			_.getKey('field')
		));
		const stringsFiltersQuery = {
			bool: {
				must: makeQueryFromStringsFilters(decodedStringsFilters)
			}
		}
		allFilters.push(stringsFiltersQuery);
	}

	if (allFilters.length) {
		request.filter = { query: { bool: { filter: allFilters } } };
	} else {
		request.filter = { query: { match_all: {} } };
	}

	// not needed currently, but allows for more flexibility in the future
	fieldsInvolved = _.uniques(fieldsInvolved);

	const coverage = field
		? await calculateCoverage(allFilters, fieldsInvolved, field, null)
		: await calculateCoverage(allFilters, fieldsInvolved, field1, field2)

	reply.coverage = coverage;
	reply.noData = false;

	const count = coverage.filtered;
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

};

export const formatPayload = async (request, reply, payload) => {
	return reply.noData
		? payload
		: {
			code: 200,
			data: payload,
			coverage: reply.coverage,
			message: 'aggregation successful',
			request: {
				agg: {
					id: request.routeOptions.url.slice(1),
					params: request.query
				},
				filter: request.filter
			},
			...request.meta && { meta: request.meta }
		};
};
