import {
	applyFnMap,
	getKey,
	isObjNotEmpty,
	makeMergeAppliedFnMap,
	makeWithKeys,
	mergeObj,
	mergeWithMerge
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {RISON} from 'rison2';
import {derived, writable} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {explorerActor} from '$lib/statechart/index.js';
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
	_.flatMapWith(_.mapWith(getKey)),
	extent,
	applyFnMap({
		max: _.last,
		Max: _.last,
		min: _.head,
		Min: _.head,
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

			const timelineFilter = mergeWithMerge(
				dateMetricsById.installation_date,
				getTimelinesExtent(staticData.timelines)
			);

			const filters = formatFilters([
				...numFilters,
				...catFilters,
				timelineFilter
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
		const entityIndex = _.findIndex(
			filters,
			_.hasKeyValue('key', entityName)
		);
		const fieldIndex = _.findIndex(
			filters[entityIndex].values,
			_.hasKeyValue('id', fieldName)
		);
		const field = filters[entityIndex].values[fieldIndex];

		filters[entityIndex].values[fieldIndex] = {
			...field,
			...objToMerge
		};

		return filters;
	});
}

const getSelectedCats = _.pipe([
	_.filterWith(_.hasKeyValue('selected', true)),
	_.mapWith(getKey)
]);

const getFiltertQuery = filters => {
	if (!filters) {
		return null;
	}
	const query = {};
	filters.forEach(({values: metrics}) => {
		_.forEach(
			metrics,
			metric => {
				if (metric.type === 'number' || metric.type === 'date') {
					const subQuery = {};
					if (metric.max !== metric.Max) {
						subQuery.lte = metric.max;
					}
					if (metric.min !== metric.Min) {
						subQuery.gte = metric.min;
					}
					if (isObjNotEmpty(subQuery)) {
						query[metric.id] = subQuery;
					}
				} else if (metric.type === 'category') {
					if (_.someIn(metric.values, ({selected}) => !selected)) {
						query[metric.id] = getSelectedCats(metric.values);
					}
				}
			}
		);
	});
	return isObjNotEmpty(query) ? RISON.stringify(query) : '';
}

const _filterQuery = derived(_filters, getFiltertQuery);
let lastFilterQuery;
_filterQuery.subscribe(filterQuery => {
	if (filterQuery !== lastFilterQuery) {
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {filterQuery}
		});
		lastFilterQuery = filterQuery;
	}
});
