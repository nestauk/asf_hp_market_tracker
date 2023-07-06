import {
	applyFnMap,
	concatValues,
	getKey,
	isObjNotEmpty,
	makeMergeAppliedFnMap,
	mergeObj,
	mergeWithMerge
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';
import {RISON} from 'rison2';
import {get, writable} from 'svelte/store';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray, pluckKeySorted} from '$lib/utils/svizzle/utils';

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

export const getFilter = (entityName, fieldName) => {
	const filters = get(_filters);

	if (!filters) {
		return {};
	}
	const entityIndex = _.findIndex(
		filters,
		_.hasKeyValue('key', entityName)
	);
	if (entityIndex === -1) {
		return {};
	}
	const fieldIndex = _.findIndex(
		filters[entityIndex].values,
		_.hasKeyValue('id', fieldName)
	);
	if (fieldIndex === -1) {
		return {};
	}
	const filter = filters[entityIndex].values[fieldIndex] || {};

	return filter;
}

const getSelectedCats = _.pipe([
	_.filterWith(_.hasKeyValue('selected', true)),
	_.mapWith(getKey)
]);

export const getFilterQuery = filters => {
	if (!filters) {
		return '';
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

	const result = isObjNotEmpty(query) ? RISON.stringify(query) : '';
	console.log('in _filterQuery', result)

	return result;
}

// export const _filterQuery = derived(_filters, getFilterQuery);
