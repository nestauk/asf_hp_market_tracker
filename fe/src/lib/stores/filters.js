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
import {get, derived, writable} from 'svelte/store';

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
	_.when(_.isUndefined, _.always({})),
	_.values,
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

			const filters = _.index(
				[
					...numFilters,
					...catFilters,
					timelineFilter
				],
				_.getKey('id')
			);

			console.log('in _filters', _.values(filters))

			return filters;
		});
	}
});

export const _groupedFilters = derived(_filters, formatFilters);

const getSelectedCats = _.pipe([
	_.filterWith(_.hasKeyValue('selected', true)),
	_.mapWith(getKey)
]);

export const getFilterQuery = filters => {
	if (!filters) {
		return '';
	}

	const query = {};
	_.forEach(
		filters,
		({values: metrics}) => {
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
		}
	);

	const result = isObjNotEmpty(query) ? RISON.stringify(query) : '';

	return result;
}

export const _filterQuery = derived(_groupedFilters, getFilterQuery);
