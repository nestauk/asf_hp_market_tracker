import {areAllTruthy, getLength, isIterableNotEmpty} from '@svizzle/utils';
import * as _ from 'lamb';
import {get} from 'svelte/store';

import {_viewCache} from '$lib/stores/data.js';
import {_currentPage} from '$lib/stores/navigation.js';

export const isViewDataCached = ctx => {
	const page = get(_currentPage);
	const viewCache = get(_viewCache);
	const key = `${page.route.id}-${ctx.viewQueryPath}`;

	return _.has(viewCache, key);
}

const areKeysEqual = _.allOf([
	_.pipe([_.mapWith(getLength), _.apply(_.areSame)]),
	_.pipe([
		_.mapWith(_.sortWith()),
		_.apply(_.zip),
		_.mapWith(_.apply(_.areSame)),
		areAllTruthy
	])
]);
export const hasFullSearchParams = ctx => {
	const ctxSelectionKeys = _.keys(ctx.selection);
	const searchParamsKeys = Array.from(ctx.page.url.searchParams.keys());
	const pass = areKeysEqual([ctxSelectionKeys, searchParamsKeys]);

	return pass;
}
