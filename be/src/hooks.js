import * as _ from 'lamb';
import rison from 'rison';

import { minDocCount } from './conf.js';
import { getFilterQuery, getStringsFiltersQuery } from './filter.js';
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
	let allFiltersFields = [];

	if (filter) {
		const decodedFilter = rison.decode(filter);

		const filterQuery = getFilterQuery(decodedFilter);
		allFilters.push(...filterQuery);
		allFiltersFields.push(..._.keys(decodedFilter));

		request.originalFilter = decodedFilter;
	} else {
		request.originalFilter = {};
	}

	if (stringsFilters) {
		const decodedStringsFilters = rison.decode(stringsFilters);

		const stringsFiltersQuery = {
			bool: {
				must: getStringsFiltersQuery(decodedStringsFilters)
			}
		}
		allFilters.push(stringsFiltersQuery);
		allFiltersFields.push(..._.map(
			decodedStringsFilters,
			_.getKey('field')
		));
	}

	if (allFilters.length) {
		request.filter = { query: { bool: { filter: allFilters } } };
	} else {
		request.filter = { query: { match_all: {} } };
	}

	// not needed currently, but allows for more flexibility in the future
	// allFiltersFields = _.uniques(allFiltersFields);

	const coverage = field
		? await calculateCoverage(allFilters, allFiltersFields, field, null)
		: await calculateCoverage(allFilters, allFiltersFields, field1, field2)

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
