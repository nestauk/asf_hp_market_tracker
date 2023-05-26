import {get} from 'svelte/store';
import {assign} from 'xstate';

import {_viewCache} from '$lib/stores/data.js';
import {_activeViewType, _currentMetric} from '$lib/stores/navigation.js';
import {_isViewLoading, _viewData} from '$lib/stores/view.js';

/* loading icon */

export const showViewLoadingIcon = ctx => {
	_isViewLoading.set(true);
}

export const hideViewLoadingIcon = ctx => {
	_isViewLoading.set(false);
}

/* view data */

export const logViewData = (ctx, {data}) => {
	console.log('viewData:', data);
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
				// case 'stats': // BE TBD: cardinality
				case 'geo':
					switch (id) {
						case 'installations':
							aggId = 'terms';
							params = {
								field: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
							};
							break;
						case 'installers':
							aggId = 'terms1_cardinality2';
							params = {
								field1: `installer_geo_region_${ctx.selection.regionType}_name.keyword`,
								field2: `hp_id_brand.keyword`,
								// field2: `installer_id.keyword`, TODO
							};
							break;
						case 'installations_per_installer':
							aggId = 'terms1_terms2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// field2: `installer_id.keyword`, TODO
								field2: `hp_id_brand.keyword`,
								with_stats2: true
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
							aggId = 'date_histogram1_terms2'; // TBD date_histogram1_cardinality2?
							params = {
								field1: `installation_date`,
								calendar_interval1: ctx.selection.interval,
								field2: `hp_id_brand.keyword`,
								// field2: `installer_id.keyword`,
								// we need the length of the nested array
							};
							break;
						case 'installations_per_installer': // TBD date_histogram1_cardinality2_pipeline3?
							aggId = 'date_histogram1_terms2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: `installation_date`,
								field2: `hp_id_brand.keyword`,
								// field2: `installer_id.keyword`,
								// we need to return the array `doc_count`s to run stats / histogram
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

	const viewQueryPath = `${aggId}?${new URLSearchParams(params)}`;

	// console.log('viewQueryPath', viewQueryPath);

	return {...ctx, viewQueryPath}
});

export const cacheViewData = (ctx, {data}) => {
	_viewCache.update(viewCache => {
		viewCache[ctx.viewQueryPath] = data;

		return viewCache;
	});
}

export const updateDataStoresFromCache = ctx => {
	const viewCache = get(_viewCache);
	_viewData.set(viewCache[ctx.viewQueryPath]);
}

export const updateDataStores = (ctx, {data}) => {
	_viewData.set(data);
}
