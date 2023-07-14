import * as _ from 'lamb';

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
