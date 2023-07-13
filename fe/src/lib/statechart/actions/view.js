import {
	getId,
	isObjNotEmpty,
	mergeWithMerge
} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';
import {get} from 'svelte/store';
import {assign} from 'xstate';

import {
	categoricalMetricsById,
	dateMetricsById,
	numericMetricsById,
} from '$lib/data/metrics.js';
import {_viewCache, _staticData} from '$lib/stores/data.js';
import {
	_activeViewType,
	_currentMetric,
	_currentPage,
} from '$lib/stores/navigation.js';
import {_isViewLoading, _viewData} from '$lib/stores/view.js';
import {
	createNumericFilters,
	getCategoricalFiltersPresets,
	getQueryFromFilters,
	getTimelinesExtent,
} from '$lib/utils/filters.js';

/* loading icon */

export const showViewLoadingIcon = () => {
	_isViewLoading.set(true);
}

export const hideViewLoadingIcon = () => {
	_isViewLoading.set(false);
}

/* view data */

export const logViewData = (ctx, {data}) => {
	console.log('[logViewData] response:', data);
}

// eslint-disable-next-line complexity
export const generateQueryPathFromSelectionStores = assign(ctx => {
	const activeViewType = get(_activeViewType);
	const {field, id, type} = get(_currentMetric);

	let endpoint;
	let params;
	switch (type) {
		case 'category':
			switch (activeViewType) {
				case 'geo':
					endpoint = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown'
					};
					break;
				case 'stats':
					endpoint = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown'
					};
					break;
				case 'time':
					endpoint = 'date_histogram1_terms2';
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
							endpoint = 'terms';
							params = {
								field: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								// TBD `with_stats`, `with_percentiles`
							};
							break;
						case 'installations_per_installer':
							endpoint = 'terms1_terms2';
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
							endpoint = 'terms1_stats2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								field2: field,
							}
							break;
						case 'installers_certified':
							endpoint = 'terms1_certified2'
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
							};
							break;
						case 'installers_dropped_certifications':
							endpoint = 'terms1_certified2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								logic2: 'dropped'
							};
							break;
						case 'installers_new_certifications':
							endpoint = 'terms1_certified2';
							params = {
								field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
								logic2: 'new'
							};
							break;
						case 'installers':
							endpoint = 'terms1_cardinality2';
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
							endpoint = 'count';
							params = {};
							break;
						case 'installations_per_installer':
							endpoint = 'terms';
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
							endpoint = 'stats';
							params = {
								field,
							};
							break;
						case 'installers_certified':
							endpoint = 'certified';
							params = {};
							break;
						case 'installers_dropped_certifications':
							endpoint = 'certified';
							params = {
								logic: 'dropped'
							}
							break;
						case 'installers_new_certifications':
							endpoint = 'certified';
							params = {
								logic: 'new'
							}
							break;
						case 'installers':
							endpoint = 'cardinality';
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
							endpoint = 'date_histogram';
							params = {
								calendar_interval: ctx.selection.interval,
								field: 'installation_date',
							};
							break;
						case 'installations_per_installer':
							endpoint = 'date_histogram1_terms2';
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
							endpoint = 'date_histogram1_stats2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installation_date',
								field2: field,
							};
							break;
						case 'installers_certified':
							endpoint = 'date_histogram1_certified2';
							params = {
								calendar_interval1: ctx.selection.interval
							};
							break;
						case 'installers_dropped_certifications':
							endpoint = 'date_histogram1_cardinality2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installer_certificate_date_end',
								field2: 'installer_id_hash.keyword',
								missing2: '2024-02-01'
							};
							break;
						case 'installers_new_certifications':
							endpoint = 'date_histogram1_cardinality2';
							params = {
								calendar_interval1: ctx.selection.interval,
								field1: 'installer_certificate_date_start',
								field2: 'installer_id_hash.keyword',
							};
							break;
						case 'installers':
							endpoint = 'date_histogram1_cardinality2';
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
					endpoint = 'terms1_stats2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: id,
					};
					break;
				case 'stats':
					endpoint = 'histogram';
					params = {
						bins: 10,
						field: id,
					};
					break;
				case 'time':
					endpoint = 'date_histogram1_stats2';
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
					endpoint = 'terms1_terms2';
					params = {
						field1: `property_geo_region_${ctx.selection.regionType}_name.keyword`,
						field2: `${id}.keyword`,
						missing2: 'Unknown',
					};
					break;
				case 'stats':
					endpoint = 'terms';
					params = {
						field: `${id}.keyword`,
						missing: 'Unknown',
						size: ctx.selection.stringsTopCount
					};
					break;
				case 'time':
					endpoint = 'date_histogram1_terms2';
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

	let viewQueryPath = endpoint;

/* 	if (ctx.selection.filters !== '') {
		const filters = RISON.parse(ctx.selection.filters);
		const query = getQueryFromFilters(filters);

		const queryRison = isObjNotEmpty(query) ? RISON.stringify(query) : '';

		params.filter = queryRison;
	} */

	if (isObjNotEmpty(params)) {
		viewQueryPath = `${endpoint}?${new URLSearchParams(params)}`;
	}

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

export const updateViewDataStoreFromCache = ctx => {
	const currentPage = get(_currentPage);
	const viewCache = get(_viewCache);
	const key = `${currentPage.route.id}-${ctx.viewQueryPath}`;

	_viewData.set(viewCache[key]);
}

export const updateViewDataStore = (ctx, {data: response}) => {
	const page = get(_currentPage);

	_viewData.set({response, page});
}

export const updateFilters = assign(ctx => {
	let {selection: {filters}} = ctx;
	const staticData = get(_staticData);
	if (staticData) {
		const numFiltersById = mergeWithMerge(
			numericMetricsById,
			staticData.numStats
		);
		const numFilters = createNumericFilters(numFiltersById);

		const catFiltersById = mergeWithMerge(
			categoricalMetricsById,
			getCategoricalFiltersPresets(staticData.catStats)
		);
		const catFilters = _.values(catFiltersById);

		const timelineFilter = mergeWithMerge(
			dateMetricsById.installation_date,
			getTimelinesExtent(staticData.timelines)
		);

		const defaultFilters = _.index(
			[
				...numFilters,
				...catFilters,
				timelineFilter
			],
			getId
		);

		filters = {
			...defaultFilters,
			...filters
		}
	}
	const newCtx = {...ctx};
	newCtx.selection.filters = filters;
	return newCtx;
});
