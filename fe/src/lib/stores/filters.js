import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {_selection} from '$lib/stores/navigation.js';
import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils';

export const _filters = derived(_selection, ({filters}) => filters);

export const _filtersBar = derived(
	_filters,
	_.pipe([
		_.when(_.isUndefined, _.always({})),
		_.values,
		_.groupBy(_.getKey('entity')),
		objectToKeyValuesArray
	])
);
