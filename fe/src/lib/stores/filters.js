import {
	applyFnMap,
	concatValues,
	isNotNil,
	mergeWithMerge,
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {categoricalMetricsById, numericMetricsById} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray, pluckKeySorted} from '$lib/utils/svizzle/utils';

/* categorical filters */

const getValuesArray = _.mapValuesWith(
	applyFnMap({
		values: _.identity,
	})
);

const formatFilters = _.pipe([
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

export const _filtersBar = derived(
	_staticData,
	staticData => {
		if (!staticData) {
			return [];
		}
		const numData = mergeWithMerge(
			staticData.numStats,
			getValuesArray(staticData.numHists)
		)
		const numFiltersById = mergeWithMerge(
			numericMetricsById,
			numData,
		);
		const numFilters = _.values(numFiltersById);

		const catFiltersById = mergeWithMerge(
			categoricalMetricsById,
			getValuesArray(staticData.catStats)
		);
		const catFilters = _.values(catFiltersById);

		const defaultFilters = formatFilters([
			...numFilters,
			...catFilters,
		]);

		return defaultFilters;
	}
);

/* timeline filter */

const getTimeDomain = _.pipe([
	pluckKeySorted,
	_.collect([_.take(2), _.last]),
	([[first, second], last]) => [first, last + second - first]
]);

const getTimelinesExtent = _.pipe([
	_.mapValuesWith(getTimeDomain),
	concatValues,
	extent,
	applyFnMap({
		Max: _.last,
		Min: _.head,
	}),
]);

export const _installationDateExtent = derived(
	_staticData,
	_.when(
		isNotNil,
		_.pipe([
			_.getKey('timelines'),
			getTimelinesExtent
		])
	)
);
