<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {format} from 'd3-format';
	import {interpolateYlGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import NumGeoView from '$lib/components/explorer/medium/NumGeoView.svelte';
	import {_viewCache} from '$lib/stores/data.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {
		getCardinalityValue,
		getDocCount,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const valueAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: getDocCount,
		installers_certified: _.getPath('certified.value'),
		installers_dropped_certifications: _.getPath('certified.value'),
		installers_new_certifications: _.getPath('certified.value'),
		installers: getCardinalityValue,
		property_feature_total_floor_area_sum: getStatsSum,
		property_supply_photovoltaic_sum: getStatsSum,
	}

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let doDraw = false;
	let formatFn;
	let items;
	let makeBarchartItems;
	let makeDomain;
	let title;
	let valueAccessor;

	$: if (proceed) {
		items = $_viewData?.response.data.terms.buckets || [];
		valueAccessor = valueAccessors[$_currentMetric.id];

		const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));

		makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);
		makeBarchartItems = _.pipe([
			filter,
			_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
			_.sortWith([_.sorterDesc(getValue)])
		]);
		title = $_currentMetric.id === 'installations_per_installer'
			? 'Average'
			: null;
		formatFn = $_currentMetric?.formatSpecifier
			? format($_currentMetric.formatSpecifier)
			: $_currentMetric.id === 'installations_per_installer'
				? roundTo1
				: _.identity;

		doDraw = true;
	}
</script>

{#if doDraw}
	<NumGeoView
		{formatFn}
		{interpolateColor}
		{items}
		{makeBarchartItems}
		{makeDomain}
		{title}
		{valueAccessor}
	/>
{/if}
