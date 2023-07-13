import {isArray, isNotNaN, isObject} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';
import {assign} from 'xstate';

import {goto} from '$app/navigation';
import {
	_activeViewType,
	_currentMetricId,
	_currentPage,
	_selection,
} from '$lib/stores/navigation.js';

// PAGE_CHANGED

export const updateNavStores = assign((ctx, {page}) => {
	// '/explorer/category/stats/[slug]' => 'stats'
	_activeViewType.set(page.route.id.split('/')[3]);

	_currentMetricId.set(page.params.slug);
	_currentPage.set(page);

	return {...ctx, page};
});

export const updateCtxSelectionFromPage = assign(ctx => {
	// ?foo=1 => {foo: 1}
	const searchParams = _.fromPairs(Array.from(ctx.page.url.searchParams.entries()));
	const parsedSearchParams = _.mapValues(
		searchParams,
		value => {
			const dontParseIt = value === '' || isNotNaN(parseInt(value[0]));
			const result = dontParseIt ? value : RISON.parse(value);

			return result
		}
	);

	const selection = {...ctx.selection, ...parsedSearchParams};

	return {...ctx, selection};
});

export const updateSelectionStore = ({selection}) => {
	_selection.set(selection);
}

export const needsStringify = _.anyOf([isArray, isObject]);
export const processParam = value =>
	needsStringify(value) ? RISON.stringify(value) : value;

export const navigateToFullSearchParams = ctx => {
	const processedSelection = _.mapValues(ctx.selection, processParam);
	const searchParams =
		_.fromPairs(Array.from(ctx.page.url.searchParams.entries()));
	const fullSearchParams = new URLSearchParams({
		...processedSelection,
		...searchParams,
	});
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

	const processedNextSelection = _.mapValues(nextSelection, processParam);
	const nextSearchParams = new URLSearchParams(processedNextSelection);

	return {
		...ctx,
		nextSearchParams,
		nextSelection,
	};
});

export const navigateToNextParams = ctx => {
	const url =
		`${window.location.origin}${window.location.pathname}?${ctx.nextSearchParams}`;

	// console.log('next url:', url)

	goto(url, {
		keepFocus: true,
		noScroll: true,
		replaceState: false,
	})
	// .catch() // TBD
};
