import {isNotNaN} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';
import {get} from 'svelte/store';
import {assign} from 'xstate';

import {goto} from '$app/navigation';
import {metricById} from '$lib/data/metrics.js';
import {_installationDateExtent} from '$lib/stores/filters.js';
import {
	_activeViewType,
	_currentMetric,
	_currentMetricId,
	_currentPage,
	_selection,
} from '$lib/stores/navigation.js';
import {getRegionsSelection} from '$lib/utils/regions.js';
import {objectToSearchParams, risonifyValues} from '$lib/utils/svizzle/url.js';

// PAGE_CHANGED

export const updateNavStores = assign((ctx, {page}) => {
	// '/explorer/category/stats/[slug]' => 'stats'
	_activeViewType.set(page.route.id.split('/')[3]);

	const metricId = page.params.slug;
	_currentMetricId.set(metricId);
	_currentMetric.set(metricById[metricId]);
	_currentPage.set(page);

	return {...ctx, page};
});

export const updateCtxSelectionFromPage = assign(ctx => {
	// ?foo=1 => {foo: 1}
	const searchParams = _.fromPairs(Array.from(ctx.page.url.searchParams.entries())); // TODO `searchParamsToObject`
	const parsedSearchParams = _.mapValues(
		searchParams,
		value => {
			const dontParseIt = value === '' || isNotNaN(parseInt(value[0]));
			const result = dontParseIt ? value : RISON.parse(value);

			return result
		}
	);

	let selection = {...ctx.selection, ...parsedSearchParams};

	const regionsSelection = getRegionsSelection({
		currentMetric: get(_currentMetric),
		filters: selection.filters,
		regionType: selection.regionType
	});

	selection = {
		...selection,
		...regionsSelection,
	};

	_selection.set(selection);

	return {...ctx, selection};
});

export const navigateToFullSearchParams = ctx => {
	/* searchParams */

	const searchParams =
		_.fromPairs(Array.from(ctx.page.url.searchParams.entries()));
	const parsedSearchParams = _.mapValues(
		searchParams,
		value => {
			const dontParseIt = value === '' || isNotNaN(parseInt(value[0]));
			const result = dontParseIt ? value : RISON.parse(value);

			return result;
		}
	);

 	const {filters} = ctx.selection;
 	const {installation_date} = filters;
	const {minTime, maxTime} = installation_date || {};
	const {Min: gte, Max: lte} = get(_installationDateExtent); // it fails here

	const criteria = {
		gte: minTime || gte,
		lte: maxTime || lte,
	};
	filters.installation_date = criteria;

	/* merge selection & parsedSearchParams: FIXME make this generic */

	const newFilters = RISON.stringify({
		...filters,
		...parsedSearchParams.filters,
	});

	// FIXME these are arrays, we need a fn to merge properly
	const newRegionTypes = RISON.stringify(
		_.sort(_.uniques([
			...ctx.selection.regionTypes,
			...parsedSearchParams.regionTypes || [],
		]))
	);

	const newSelection = {
		...ctx.selection,
		...parsedSearchParams,
		filters: newFilters,
		regionTypes: newRegionTypes
	};

	/* serialise values and navigate */

	const fullSearchParams = objectToSearchParams(newSelection);
	const url =
		`${window.location.origin}${window.location.pathname}?${fullSearchParams}`;

	goto(url, {
		keepFocus: true,
		noScroll: true,
		replaceState: true,
	})
	// .catch() // TBD
};

// SELECTION_CHANGED

export const setCtxNextValues = assign((ctx, {newValues}) => {
	const nextSelection = {...ctx.selection, ...newValues};

	const risonifiedNextSelection = risonifyValues(nextSelection);
	const nextSearchParams = objectToSearchParams(risonifiedNextSelection);

	return {
		...ctx,
		nextSearchParams,
		nextSelection,
	};
});

export const navigateToNextParams = ctx => {
	const url =
		`${window.location.origin}${window.location.pathname}?${ctx.nextSearchParams}`;

	// import {isDev} from '$lib/env.js';
	// if (isDev) {
	// 	console.log('next url:', url);
	// }

	goto(url, {
		keepFocus: true,
		noScroll: true,
		replaceState: false,
	})
	// .catch() // TBD
};
