import {makeMergeAppliedFnMap, mergeWith} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {numericMetricsById} from '$lib/data/metrics.js';
import {_staticData} from '$lib/stores/data.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';

const merge = mergeWith(_.merge);
const formatFilters = _.pipe([
	_.values,
	_.mapWith(makeMergeAppliedFnMap({
		Max: _.getKey('max'),
		Min: _.getKey('min'),
	})),
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

export const _filters = writable();

_staticData.subscribe(staticData => {
	if (staticData) {
		_filters.update(() => {
			const numFiltersById = merge(numericMetricsById, staticData.numStats);

			const filters = formatFilters(numFiltersById);

			return filters;
		});
	}
});

_filters.subscribe(filters => {
	console.log(filters)
});
