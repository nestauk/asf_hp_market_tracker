import {
	applyFnMap,
	concatValues,
	mergeWithMerge,
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray, pluckKeySorted} from '$lib/utils/svizzle/utils';

const formatFilters = _.pipe([
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

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
		max: _.last,
		Max: _.last,
		min: _.head,
		Min: _.head,
	}),
]);

/* categorical filters */

const getWrappedCategoricalFilters = _.mapValuesWith(
	applyFnMap({
		values: _.identity,
	})
);

export const _filtersBar = derived(
	_staticData,
	staticData => {
		if (!staticData) {
			return [];
		}
		const numFiltersById = mergeWithMerge(
			numericMetricsById,
			staticData.numStats
		);
		const numFilters = _.values(numFiltersById);

		const catFiltersById = mergeWithMerge(
			categoricalMetricsById,
			getWrappedCategoricalFilters(staticData.catStats)
		);
		const catFilters = _.values(catFiltersById);

		const timelineFilter = mergeWithMerge(
			dateMetricsById.installation_date,
			getTimelinesExtent(staticData.timelines)
		);

		const defaultFilters = formatFilters([
			...numFilters,
			...catFilters,
			timelineFilter
		]);

		return defaultFilters;
	}
);
