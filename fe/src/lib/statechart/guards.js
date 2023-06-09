import {areAllTruthy, getLength, isNotNil} from '@svizzle/utils';
import * as _ from 'lamb';
import {get} from 'svelte/store';

import {_viewCache, _staticData} from '$lib/stores/data.js';
import {_currentPage} from '$lib/stores/navigation.js';

/* view data */

export const isViewDataCached = ctx => {
	const page = get(_currentPage);
	const viewCache = get(_viewCache);
	const key = `${page.route.id}-${ctx.viewQueryPath}`;

	return _.has(viewCache, key);
}

/* navigation */

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

/* static data */

const checkStaticData = _.allOf([
	isNotNil,
	_.hasKey('timelines')
]);
export const hasStaticData = (ctx, {data}) => {
	const staticData = get(_staticData);
	const pass = checkStaticData(staticData);

	return pass;
};
