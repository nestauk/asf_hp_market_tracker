import {
	applyFnMap,
	concatValues,
	getId,
	getKey,
	isNotNil,
	mergeWithMerge,
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {categoricalMetricsById, numericMetricsById} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {getEntity} from '$lib/utils/getters.js';
import {
	objectToKeyValuesArray,
	pluckKeySorted,
} from '$lib/utils/svizzle/utils.js';

/* categorical filters */

const getValuesArray = _.mapValuesWith(
	applyFnMap({
		values: _.identity,
	})
);

const formatFilters = _.pipe([
	_.groupBy(getEntity),
	_.mapValuesWith(_.sortWith([getId])),
	objectToKeyValuesArray,
	_.sortWith([getKey]),
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
			{entity: 'Installer', id: 'installer_geo_region'},
			{entity: 'Property', id: 'property_geo_region'}
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
