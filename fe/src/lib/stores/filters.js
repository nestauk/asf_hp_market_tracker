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

/* categorical filters */

const getWrappedCategoricalFilters = _.mapValuesWith(
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
	staticData => {
		const timelineFilter = mergeWithMerge(
			dateMetricsById.installation_date,
			getTimelinesExtent(staticData.timelines)
		);

		return timelineFilter;
	}
);
