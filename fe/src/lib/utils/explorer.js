import {get} from 'svelte/store';
import {mergeWithMerge} from '@svizzle/utils';

import {explorerActor} from '$lib/statechart/index.js';
import {_selection} from '$lib/stores/navigation.js';

export const updateFilters = filter => {
	const oldFilters = get(_selection);
	const newFilters = mergeWithMerge(oldFilters, filter);
	explorerActor.send({
		type: 'SELECTION_CHANGED',
		newValues: {filters: newFilters}
	});
}
