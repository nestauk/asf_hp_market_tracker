import {areAllTruthy, getLength, isIterableNotEmpty} from '@svizzle/utils';
import * as _ from 'lamb';
import {get} from 'svelte/store';

import {_viewCache} from '$lib/stores/data.js';

export const isViewDataCached = ctx => {
	const viewCache = get(_viewCache);

	return _.has(viewCache, ctx.viewQueryPath);
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
export const hasFullSearchParams = (ctx, {page}) => {
	const ctxSelectionKeys = _.keys(ctx.selection);
	const searchParamsKeys = Array.from(page.url.searchParams.keys());
	const pass = areKeysEqual([ctxSelectionKeys, searchParamsKeys]);

	return pass;
}
