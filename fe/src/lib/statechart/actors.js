import {applyFnMap} from '@svizzle/utils';
import * as _ from 'lamb';

import {intervals} from '$lib/config/time.js';
import {categoricalMetrics, numericMetrics} from '$lib/data/metrics.js';
import {selectedBeURL} from '$lib/env.js';

const query = backendPath =>
	fetch(`${selectedBeURL}/${backendPath}`)
	.then(response => response.json());

export const queryViewData = ({viewQueryPath}) => query(viewQueryPath);

export const queryStaticData = () => {
	const catTermsPromises = _.map(categoricalMetrics, ({id: field}) => {
		const endpoint = 'terms';
		const params = {
			field: `${field}.keyword`
		};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	const countPromise = query('count');

	const numHistPromises = _.map(numericMetrics, ({id: field}) => {
		const endpoint = 'histogram';
		const params = {
			bins: 10,
			field,
		};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	const numStatsPromises = _.map(numericMetrics, ({id: field}) => {
		const endpoint = 'stats';
		const params = {field};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	const timelinesPromises = _.map(intervals, calendar_interval => {
		const endpoint = 'date_histogram';
		const params = {
			calendar_interval,
			field: 'installation_date'
		};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	return Promise.all([
		Promise.all(catTermsPromises),
		countPromise,
		Promise.all(numHistPromises),
		Promise.all(numStatsPromises),
		Promise.all(timelinesPromises),
	]).then(applyFnMap({
		catStats: _.getAt(0),
		count: _.getAt(1),
		numHists: _.getAt(2),
		numStats: _.getAt(3),
		timelines: _.getAt(4),
	}));
};
