import * as _ from 'lamb';
import {RISON} from 'rison2';
import {derived, get, writable} from 'svelte/store';

import {explorerActor} from '$lib/statechart/index.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';

/* all */

const formatFilters = _.pipe([
	_.when(_.isUndefined, _.always({})),
	_.values,
	_.groupBy(_.getKey('entity')),
	objectToKeyValuesArray
]);

export const _filters = writable();

export const _filtersBar = derived(_filters, formatFilters);

let lastFilters = '';
export const sendFiltersChanged = () => {
	const filters = get(_filters);
	const filtersRison = filters ? RISON.stringify(filters) : ''
	if (filtersRison !== lastFilters) {
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {filters: filtersRison}
		});
		lastFilters = filtersRison;
	}
}
