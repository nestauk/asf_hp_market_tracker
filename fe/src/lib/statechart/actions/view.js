import {get} from 'svelte/store';
import {assign} from 'xstate';

import {_viewCache} from '$lib/stores/data.js';
import {
	_activeViewType,
	_currentMetric,
	_currentPage,
} from '$lib/stores/navigation.js';
import {_isViewLoading, _viewData} from '$lib/stores/view.js';
import {isObjNotEmpty} from '@svizzle/utils';

/* loading icon */

export const showViewLoadingIcon = () => {
	_isViewLoading.set(true);
}

export const hideViewLoadingIcon = () => {
	_isViewLoading.set(false);
}

/* view data */

export const logViewData = (ctx, {data}) => {
	console.log('response:', data);
}

// eslint-disable-next-line complexity
export const generateQueryPathFromSelectionStores = assign(ctx => {
	const activeViewType = get(_activeViewType);
	const {id, type} = get(_currentMetric);

	let aggId;
	let params;
	switch (type) {
		case 'category':
			switch (activeViewType) {
				case 'stats':
					aggId = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown'
					};
					break;
				case 'geo':
					aggId = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown'
					};
					break;
				case 'time':
					aggId = 'date_histogram1_terms2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: `installation_date`,
						field2: `${id}.keyword`,
						missing2: 'Unknown'
					};
					break;
				default:
					break;
			}
			break;
		case 'count':
			switch (activeViewType) {
				case 'stats':
					switch (id) {
						case 'installations':
							aggId = 'count';
							params = {};
							break;
						case 'installers':
							aggId = 'cardinality';
							params = {
								field: `installer_id_hash.keyword`,
							};
							break;
						case 'installations_per_installer':
							aggId = 'terms';
							params = {
								field: `installer_id_hash.keyword`,
								with_stats: true
							};
							break;
						default:
							break;
					}
					break;
				case 'geo':
					switch (id) {
						case 'installations':
							aggId = 'terms';
							params = {
								field: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats`, `with_percentiles`
							};
							break;
						case 'installers':
							aggId = 'terms1_cardinality2';
							params = {
								field1: `installer_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats1`, `with_percentiles1`
								field2: `installer_id_hash.keyword`,
							};
							break;
						case 'installations_per_installer':
							aggId = 'terms1_terms2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats1`, `with_percentiles1`
								field2: `installer_id_hash.keyword`,
								with_stats2: true
								// TBD `with_percentiles1`
							};
							break;
						default:
							break;
					}
					break;
				case 'time':
					switch (id) {
						case 'installations':
							aggId = 'date_histogram';
							params = {
								calendar_interval: ctx.selection.interval,
								field: `installation_date`,
							};
							break;
						case 'installers':
							aggId = 'date_histogram1_cardinality2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: `installation_date`,
								field2: `installer_id_hash.keyword`,
							};
							break;
						case 'installations_per_installer':
							aggId = 'date_histogram1_terms2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: `installation_date`,
								field2: `installer_id_hash.keyword`,
								with_stats2: true
							};
							break;
						default:
							break;
					}
					break;
				default:
					break;
			}
			break;
		case 'string':
			switch (activeViewType) {
				case 'stats':
					aggId = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown',
						size: ctx.selection.stringsTopCount
					};
					break;
				case 'geo':
					aggId = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown',
						size: ctx.selection.stringsTopCount
					};
					break;
				case 'time':
					aggId = 'date_histogram1_terms2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: `installation_date`,
						field2: `${id}.keyword`,
						size: ctx.selection.stringsTopCount
					};
					break;
				default:
					break;
			}
			break;
		case 'number':
			switch (activeViewType) {
				case 'stats':
					aggId = 'histogram';
					params = {
						bins: 10,
						field: id,
					};
					break;
				case 'geo':
					aggId = 'terms1_stats2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: id,
					};
					break;
				case 'time':
					aggId = 'date_histogram1_stats2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: `installation_date`,
						field2: id,
					};
					break;
				default:
					break;
			}
			break;
		default:
			break;
	}

	let viewQueryPath = aggId;

	if (isObjNotEmpty(params)) {
		viewQueryPath = `${aggId}?${new URLSearchParams(params)}`;
	}

	// console.log('viewQueryPath', viewQueryPath);

	return {...ctx, viewQueryPath}
});

export const cacheViewData = (ctx, {data: response}) => {
	_viewCache.update(viewCache => {
		const page = get(_currentPage);
		viewCache[ctx.viewQueryPath] = {response, page};

		return viewCache;
	});
}

export const updateDataStoresFromCache = ctx => {
	const viewCache = get(_viewCache);
	_viewData.set(viewCache[ctx.viewQueryPath]);
}

export const updateDataStores = (ctx, {data: response}) => {
	const page = get(_currentPage);
	_viewData.set({response, page});
}
