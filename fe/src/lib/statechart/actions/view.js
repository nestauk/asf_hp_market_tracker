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
	const {field, id, type} = get(_currentMetric);

	let aggId;
	let params;
	switch (type) {
		case 'category':
			switch (activeViewType) {
				case 'geo':
					aggId = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown'
					};
					break;
				case 'stats':
					aggId = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown'
					};
					break;
				case 'time':
					aggId = 'date_histogram1_terms2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: 'installation_date',
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
				case 'geo':
					switch (id) {
						case 'installations':
							aggId = 'terms';
							params = {
								field: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats`, `with_percentiles`
							};
							break;
						case 'installations_per_installer':
							aggId = 'terms1_terms2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats1`, `with_percentiles1`
								field2: 'installer_id_hash.keyword',
								with_stats2: true
								// TBD `with_percentiles1`
							};
							break;
						case 'hp_feature_power_capacity_sum':
						case 'hp_feature_power_generation_sum':
						case 'installation_cost_sum':
						case 'property_feature_total_floor_area_sum':
						case 'property_supply_photovoltaic_sum':
							aggId = 'terms1_stats2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								field2: field,
							};
							break;
						case 'installers':
							aggId = 'terms1_cardinality2';
							params = {
								field1: `installer_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats1`, `with_percentiles1`
								field2: 'installer_id_hash.keyword',
							};
							break;
						default:
							break;
					}
					break;
				case 'stats':
					switch (id) {
						case 'installations':
							aggId = 'count';
							params = {};
							break;
						case 'installations_per_installer':
							aggId = 'terms';
							params = {
								field: 'installer_id_hash.keyword',
								with_stats: true
							};
							break;
						case 'hp_feature_power_capacity_sum':
						case 'hp_feature_power_generation_sum':
						case 'installation_cost_sum':
						case 'property_feature_total_floor_area_sum':
						case 'property_supply_photovoltaic_sum':
							aggId = 'stats';
							params = {
								field,
							};
							break;
						case 'installers':
							aggId = 'cardinality';
							params = {
								field: 'installer_id_hash.keyword',
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
								field: 'installation_date',
							};
							break;
						case 'installations_per_installer':
							aggId = 'date_histogram1_terms2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installation_date',
								field2: 'installer_id_hash.keyword',
								with_stats2: true
							};
							break;
						case 'hp_feature_power_capacity_sum':
						case 'hp_feature_power_generation_sum':
						case 'installation_cost_sum':
						case 'property_feature_total_floor_area_sum':
						case 'property_supply_photovoltaic_sum':
							aggId = 'date_histogram1_stats2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installation_date',
								field2: field,
							};
							break;
						case 'installers':
							aggId = 'date_histogram1_cardinality2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installation_date',
								field2: 'installer_id_hash.keyword',
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
		case 'number':
			switch (activeViewType) {
				case 'geo':
					aggId = 'terms1_stats2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: id,
					};
					break;
				case 'stats':
					aggId = 'histogram';
					params = {
						bins: 10,
						field: id,
					};
					break;
				case 'time':
					aggId = 'date_histogram1_stats2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: 'installation_date',
						field2: id,
						use_percentiles2: true,
					};
					break;
				default:
					break;
			}
			break;
		case 'string':
			switch (activeViewType) {
				case 'geo':
					aggId = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown',
					};
					break;
				case 'stats':
					aggId = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown',
						size: ctx.selection.stringsTopCount
					};
					break;
				case 'time':
					aggId = 'date_histogram1_terms2';
					params = {
						calendar_interval1: ctx.selection.interval,
						field1: 'installation_date',
						field2: `${id}.keyword`,
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
		const key = `${page.route.id}-${ctx.viewQueryPath}`;

		viewCache[key] = {
			page,
			response,
			viewQueryPath: ctx.viewQueryPath
		};

		return viewCache;
	});
}

export const updateDataStoresFromCache = ctx => {
	const page = get(_currentPage);
	const viewCache = get(_viewCache);
	const key = `${page.route.id}-${ctx.viewQueryPath}`;

	_viewData.set(viewCache[key]);
}

export const updateDataStores = (ctx, {data: response}) => {
	const page = get(_currentPage);

	_viewData.set({response, page});
}
