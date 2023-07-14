import {
	applyFnMap,
	getKey,
	makeMergeAppliedFnMap,
} from '@svizzle/utils';
import * as _ from 'lamb';

/* categorical filters */

export const getWrappedCategoricalFilters = _.mapValuesWith(
	applyFnMap({
		values: _.identity,
	})
);

export const getSelectedCats = _.pipe([
	_.filterWith(_.hasKeyValue('selected', true)),
	_.mapWith(getKey)
]);

export const enhanceCategories = (categories, selectedCats) => _.map(
	categories,
	makeMergeAppliedFnMap({
		selected: ({key}) => _.isIn(selectedCats, key)
	})
)

/* filter query builder */

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
