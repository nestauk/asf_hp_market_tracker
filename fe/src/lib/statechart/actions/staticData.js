import * as _ from 'lamb';
import {get} from 'svelte/store';
import {raise} from 'xstate';

import {_staticData} from '$lib/stores/data.js';

export const logStaticData = (ctx, {data}) => {
	console.log('[logStaticData] response:', data);
}

const indexTimelines = _.pipe([
	_.indexBy(_.getPath('request.agg.params.calendar_interval')),
	_.mapValuesWith(_.getPath('data.date_histogram.buckets'))
]);
const indexNumStats = _.pipe([
	_.indexBy(_.getPath('request.agg.params.field')),
	_.mapValuesWith(_.getPath('data.stats')),
]);
const indexCatStats = _.pipe([
	_.indexBy(_.pipe([
		_.getPath('request.agg.params.field'),
		_.replace('.keyword', '')
	])),
	_.mapValuesWith(_.getPath('data.terms.buckets')),
]);
export const updateStaticDataStore = (ctx, {data: {timelines, numStats, catStats}}) => {
	_staticData.set({
		catStats: indexCatStats(catStats),
		numStats: indexNumStats(numStats),
		timelines: indexTimelines(timelines),
	});
}
export const sendStaticDataChanged = raise(
	'STATIC_DATA_CHANGED'
);
