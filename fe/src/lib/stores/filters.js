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
import {DateTime, Duration} from 'luxon';
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
			{entity: 'Installation', id: 'installation_date'},
			{entity: 'Installer', id: 'installer_geo_region'},
			{entity: 'Property', id: 'property_geo_region'}
		]);

		return defaultFilters;
	}
);

/* timeline filter */

const durations = {
	'1M': Duration.fromObject({months: 1}),
	'1q': Duration.fromObject({quarters: 1}),
	'1y': Duration.fromObject({years: 1}),
};
const getTimeDomain = (buckets, intervalKey) => {
	const timestamps = pluckKeySorted(buckets);
	const firstBinStartMs = timestamps[0];
	const lastBinStartDateTime = DateTime.fromMillis(_.last(timestamps));
	const duration = durations[intervalKey];
	const lastBinEndMs = lastBinStartDateTime.plus(duration).toMillis();
	const domain = [firstBinStartMs, lastBinEndMs];

	return domain
};
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
