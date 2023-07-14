import {
	applyFnMap,
	concatValues,
	getKey,
	getValues,
	isObjNotEmpty,
	makeMergeAppliedFnMap,
	mergeObj,
} from '@svizzle/utils';
import {extent} from 'd3-array';
import * as _ from 'lamb';

import {pluckKeySorted} from '$lib/utils/svizzle/utils';

/* numeric filters */

export const createNumericFilters = _.pipe([
	_.values,
	_.mapWith(makeMergeAppliedFnMap({
		Max: _.getKey('max'),
		Min: _.getKey('min'),
	})),
]);

/* categorical filters */

export const getCategoricalFiltersPresets = _.mapValuesWith(
	applyFnMap({
		values: _.mapWith(mergeObj({
			selected: true // this will have to read from filters in the URL
		}))
	})
);

const getSelectedCats = _.pipe([
	_.filterWith(_.hasKeyValue('selected', true)),
	_.mapWith(getKey)
]);

/* timeline filter */

const getTimeDomain = _.pipe([
	pluckKeySorted,
	_.collect([_.take(2), _.last]),
	([[first, second], last]) => [first, last + second - first]
]);

export const getTimelinesExtent = _.pipe([
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

/* filter query builder */

const getQueryForFilter = filter => {
	let value;
	if (filter.type === 'number' || filter.type === 'date') {
		const subQuery = {};
		if (filter.max !== filter.Max) {
			subQuery.lte = filter.max;
		}
		if (filter.min !== filter.Min) {
			subQuery.gte = filter.min;
		}
		if (isObjNotEmpty(subQuery)) {
			value = subQuery;
		}
	} else if (filter.type === 'category') {
		if (_.someIn(filter.values, ({selected}) => !selected)) {
			value = getSelectedCats(filter.values);
		}
	}

	return [filter.id, value];
}

export const getQueryFromFilters = _.pipe([
	_.flatMapWith(getValues),
	_.mapWith(getQueryForFilter),
	_.fromPairs,
	_.skipIf(_.isUndefined)
]);

export const findInFiltersBar = (filtersBar, entityName, fieldName) => {
	if (!filtersBar) {
		return {};
	}
	const entityIndex = _.findIndex(
		filtersBar,
		_.hasKeyValue('key', entityName)
	);

	if (entityIndex === -1) {
		return {};
	}
	const fieldIndex = _.findIndex(
		filtersBar[entityIndex].values,
		_.hasKeyValue('id', fieldName)
	);

	if (fieldIndex === -1) {
		return {};
	}
	const filter = filtersBar[entityIndex].values[fieldIndex] || {};

	return filter;
}

export const mergeFilters = (filters, entityName, fieldName, objToMerge) => {
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
}
