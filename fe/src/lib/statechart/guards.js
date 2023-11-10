import {isNotNaN, isNotNil} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';
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
	const searchParams = _.fromPairs(Array.from(ctx.page.url.searchParams.entries()));

	// do `ctx.selection` and `ctx.page` have the same keys?

	const ctxSelectionKeys = _.keys(ctx.selection);
	const searchParamsKeys = _.keys(searchParams);
	let pass = doPairItemsContainSameValues([ctxSelectionKeys, searchParamsKeys]);

	if (pass) {
		// if so, does the URL `filters` have region criteria?

		const parsedSearchParams = _.mapValues(
			searchParams,
			value => {
				const dontParseIt = value === '' || isNotNaN(parseInt(value[0]));
				const result = dontParseIt ? value : RISON.parse(value);

				return result;
			}
		);

		pass =
			_.has(parsedSearchParams, 'filters') &&
			_.has(parsedSearchParams.filters, 'installerRegionNames') &&
			_.has(parsedSearchParams.filters, 'installerRegionType') &&
			_.has(parsedSearchParams.filters, 'propertyRegionNames') &&
			_.has(parsedSearchParams.filters, 'propertyRegionType') &&
			_.has(parsedSearchParams.filters, 'installation_date');
	}

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
