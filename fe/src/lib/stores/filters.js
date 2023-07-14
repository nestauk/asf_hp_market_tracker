import {mergeWithMerge} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, get} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_selection} from '$lib/stores/navigation.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';
import {
	createNumericFilters,
	getCategoricalFiltersPresets,
	getTimelinesExtent,
} from '$lib/utils/filters.js';

const formatFilters = _.pipe([
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

const getDefaultFiltersBar = staticData => {
	const numFiltersById = mergeWithMerge(
		numericMetricsById,
		staticData.numStats
	);
	const numFilters = createNumericFilters(numFiltersById);

	const catFiltersById = mergeWithMerge(
		categoricalMetricsById,
		getCategoricalFiltersPresets(staticData.catStats)
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
	[_selection, _staticData],
	([{filters}, staticData]) => {
		let filtersBar = [];
		if (staticData) {
			const defaultFilters = getDefaultFiltersBar(staticData);

			/*
			filtersBar = [
				...defaultFilters,
				...filters
			];
			*/

			// temporary
			filtersBar = filters.length > 0
				? filters
				: defaultFilters;
		}
		return filtersBar;
	}
);
