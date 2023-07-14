import {isNotNil} from '@svizzle/utils';
import * as _ from 'lamb';
import {get} from 'svelte/store';

import {_viewCache, _staticData} from '$lib/stores/data.js';
import {_currentPage} from '$lib/stores/navigation.js';
import {doPairItemsContainSameValues} from '$lib/utils/svizzle/utils.js';

/* view data */

export const isViewDataCached = ctx => {
	const page = get(_currentPage);
	const viewCache = get(_viewCache);
	const key = `${page.route.id}-${ctx.viewQueryPath}`;

	return _.has(viewCache, key);
}

/* navigation */

export const hasFullSearchParams = ctx => {
	const ctxSelectionKeys = _.keys(ctx.selection);
	const searchParamsKeys = Array.from(ctx.page.url.searchParams.keys());
	const pass = doPairItemsContainSameValues([
		ctxSelectionKeys,
		searchParamsKeys
	]);

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
