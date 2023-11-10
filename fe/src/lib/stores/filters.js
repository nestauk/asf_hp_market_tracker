import {
	applyFnMap,
	concatValues,
	getValues,
	isIterableNotEmpty,
	isNotNil,
	mergeWithMerge,
	transformValues,
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {DateTime, Duration} from 'luxon';
import {derived} from 'svelte/store';

import {
	categoricalMetricsById,
	metricGroups,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {_selection} from '$lib/stores/navigation.js';
import {getEntity} from '$lib/utils/getters.js';
import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

/* utils: numbers / categories */

const valuesToValuesKey = _.mapValuesWith(
	applyFnMap({
		values: _.identity,
	})
);

/* utils: filter groups */

const isFilterableField = _.anyOf([
	_.hasKeyValue('type', 'category'),
	_.hasKeyValue('type', 'number'),
]);

const extraFiltersByEntity = _.group([
	{entity: 'Installation', id: 'installation_date'},
	{entity: 'Installation company', id: 'installer_geo_region'},
	{entity: 'Property features', id: 'property_geo_region'},
	{entity: 'Heat pump features', id: 'heat_pump_brands_models'}
], getEntity);

export const _filtersBar = derived(
	_staticData,
	staticData => {
		if (!staticData) {
			return [];
		}

		/* numbers */

		const numData = mergeWithMerge(
			staticData.numStatsById,
			valuesToValuesKey(staticData.numHistsById)
		);
		const numFiltersById = mergeWithMerge(
			numericMetricsById,
			numData,
		);

		/* categories */

		const catFiltersById = mergeWithMerge(
			categoricalMetricsById,
			valuesToValuesKey(staticData.catStatsById)
		);

		/* groups */

		const getFilterGroups = _.pipe([
			_.mapWith(_.pipe([
				transformValues({
					value: _.filterWith(isFilterableField)
				}),
				({key, value}) => {
					let values = _.map(value, ({id, type}) => {
						let filter;
						if (type === 'category') {
							filter = catFiltersById[id];
						} else if (type === 'number') {
							filter = numFiltersById[id];
						}

						return filter;
					});

					if (key in extraFiltersByEntity) {
						values = [
							...extraFiltersByEntity[key],
							...values
						];
					}

					return {key, values};
				},
			])),
			_.filterWith(_.pipe([getValues, isIterableNotEmpty]))
		]);
		const filterGroups = getFilterGroups(metricGroups);

		return filterGroups;
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

export const _isDefaultInstallationDateRange = derived(
	[_installationDateExtent, _selection],
	([installationDateExtent, {filters: {installation_date}}]) => {
		let isDefaultInstallationDate = true;

		if (installationDateExtent) {
			const {Min, Max} = installationDateExtent;

			isDefaultInstallationDate = installation_date
				&& installation_date.gte === Min
				&& installation_date.lte === Max;
		}

		return isDefaultInstallationDate;
	}
);
