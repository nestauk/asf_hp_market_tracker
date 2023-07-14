import {mergeWithMerge} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';
import {
	getWrappedCategoricalFilters,
	getTimelinesExtent,
} from '$lib/utils/filters.js';

const formatFilters = _.pipe([
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

const getFiltersBar = staticData => {
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

export const _filtersBar = derived(
	[_staticData],
	([staticData]) => staticData ? getFiltersBar(staticData) : []
);
