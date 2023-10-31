import {applyFnMap} from '@svizzle/utils';
import * as _ from 'lamb';

import {intervals} from '$lib/config/time.js';
import {categoricalMetrics, numericMetrics} from '$lib/data/metrics.js';
import {selectedBeURL} from '$lib/env.js';

const query = queryPath =>
	fetch(`${selectedBeURL}/${queryPath}`)
	.then(response => response.json());

export const queryViewData = ({viewQueryPath}) => query(viewQueryPath);

const getQueryPromise = ({endpoint, params}) => {
	const queryPath = `${endpoint}?${new URLSearchParams(params)}`;

	return query(queryPath);
}

export const queryStaticData = () => {
	const brandsModelsTermsPromise = getQueryPromise({
		endpoint: 'terms1_terms2',
		params: {
			field1: 'hp_id_brand.keyword',
			field2: 'hp_id_model.keyword',
		}
	});

	const catTermsPromises = _.map(categoricalMetrics, ({id}) =>
		getQueryPromise({
			endpoint: 'terms',
			params: {
				field: `${id}.keyword` // use `esKey`?
			}
		})
	);

	const countPromise = query('count');

	const numHistPromises = _.map(numericMetrics, ({id: field}) =>
		getQueryPromise({
			endpoint: 'histogram',
			params: {
				bins: 20,
				field
			}
		})
	);

	const numStatsPromises = _.map(numericMetrics, ({id: field}) =>
		getQueryPromise({
			endpoint: 'stats',
			params: {field}
		})
	);

	const timelinesPromises = _.map(intervals, calendar_interval =>
		getQueryPromise({
			endpoint: 'date_histogram',
			params: {
				calendar_interval,
				field: 'installation_date'
			}
		})
	);

	return Promise.all([
		brandsModelsTermsPromise,
		Promise.all(catTermsPromises),
		countPromise,
		Promise.all(numHistPromises),
		Promise.all(numStatsPromises),
		Promise.all(timelinesPromises),
	]).then(applyFnMap({
		brandsModelsTerms: _.getAt(0),
		catStats: _.getAt(1),
		count: _.getAt(2),
		numHists: _.getAt(3),
		numStats: _.getAt(4),
		timelines: _.getAt(5),
	}));
};
