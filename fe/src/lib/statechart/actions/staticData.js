import * as _ from 'lamb';

import {_staticData} from '$lib/stores/data.js';

export const logStaticData = (ctx, {data}) => {
	console.log('[logStaticData] response:', data);
}

const getDataTermsBuckets = _.getPath('data.terms.buckets');

const getBrandsModels = _.pipe([
	getDataTermsBuckets,
	_.mapWith(({doc_count, key, terms: {buckets}}) =>
		({
			key,
			value: doc_count,
			values: _.map(buckets,
				({doc_count: value, key: subKey}) => ({key: subKey, value})
			),
		})
	),
]);

const indexCatStats = _.pipe([
	_.indexBy(_.pipe([
		_.getPath('request.agg.params.field'),
		_.replace('.keyword', '')
	])),
	_.mapValuesWith(getDataTermsBuckets),
]);

const getCount = _.getPath('data.count');

const indexNumHists = _.pipe([
	_.indexBy(_.getPath('request.agg.params.field')),
	_.mapValuesWith(_.getPath('data.histogram.buckets'))
]);

const indexNumStats = _.pipe([
	_.indexBy(_.getPath('request.agg.params.field')),
	_.mapValuesWith(_.getPath('data.stats')),
]);

const indexTimelines = _.pipe([
	_.indexBy(_.getPath('request.agg.params.calendar_interval')),
	_.mapValuesWith(_.getPath('data.date_histogram.buckets'))
]);

export const updateStaticDataStore = (
	ctx,
	{data: {
		brandsModelsTerms,
		catStats,
		count,
		numHists,
		numStats,
		timelines,
	}}
) => _staticData.set({
	brandsModels: getBrandsModels(brandsModelsTerms),
	catStatsById: indexCatStats(catStats),
	count: getCount(count),
	numHistsById: indexNumHists(numHists),
	numStatsById: indexNumStats(numStats),
	timelines: indexTimelines(timelines),
});
