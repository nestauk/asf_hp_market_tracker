import {
	applyFnMap,
	getKey,
	getValues,
	makeMergeAppliedFnMap,
	makeWithKeys,
	mergeObj,
	mergeWithMerge
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {writable} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';

/* numeric filters */

const createNumericFilters = _.pipe([
	_.values,
	_.mapWith(makeMergeAppliedFnMap({
		Max: _.getKey('max'),
		Min: _.getKey('min'),
	})),
]);

/* categorical filters */

const getCategoricalFiltersPresets = _.mapValuesWith(
	applyFnMap({
		values: _.mapWith(mergeObj({
			selected: true // this will have to read from filters in the URL
		}))
	})
);

/* timeline filter */

const getTimelinesExtent = _.pipe([
	_.values,
	_.flatMapWith(_.identity),
	_.mapWith(getKey),
	extent,
	makeWithKeys(['min', 'max']),
	makeMergeAppliedFnMap({
		Max: _.getKey('max'),
		Min: _.getKey('min'),
	}),
]);

/* all */

const formatFilters = _.pipe([
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

export const _filters = writable();

_staticData.subscribe(staticData => {
	if (staticData) {
		_filters.update(() => {
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

			const timeFiltersById = mergeWithMerge(
				dateMetricsById.installation_date,
				getTimelinesExtent(staticData.timelines)
			);

			console.log('timeFiltersById', timeFiltersById)

			const filters = formatFilters([
				...numFilters,
				...catFilters,
				timeFiltersById
			]);

			return filters;
		});
	}
});

_filters.subscribe(filters => {
	console.log(filters)
});

export const updateFilter = (entityName, fieldName, objToMerge) => {
	_filters.update(filters => {
		console.log('filters1', filters)
		const entityIndex = _.findIndex(
			filters,
			_.hasKeyValue('key', entityName)
		);
		console.log('entity', filters[entityIndex])

		const fieldIndex = _.findIndex(
			filters[entityIndex].values,
			_.hasKeyValue('id', fieldName)
		);
		const field = filters[entityIndex].values[fieldIndex];
		console.log('field', field)
		filters[entityIndex].values[fieldIndex] = {
			...field,
			...objToMerge
		};
		return filters;
	});
}
