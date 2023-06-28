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

	const numStatsPromises = _.map(numericMetrics, ({id: field}) => {
		const endpoint = 'stats';
		const params = {field};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	const catTermsPromises = _.map(categoricalMetrics, ({id: field}) => {
		const endpoint = 'terms';
		const params = {
			field: `${field}.keyword`,
			missing: 'Unknown'
		};
		const queryPath = `${endpoint}?${new URLSearchParams(params)}`;
		const promise = query(queryPath);

		return promise;
	});

	return Promise.all([
		...timelinesPromises,
		...numStatsPromises,
		...catTermsPromises
	]).then(applyFnMap({
		timelines: _.take(intervals.length),
		numStats: _.pipe([
			_.drop(intervals.length),
			_.take(numericMetrics.length)
		]),
		catStats: _.drop(intervals.length + numericMetrics.length)
	}));
};
