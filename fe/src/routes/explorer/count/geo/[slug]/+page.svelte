<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import NumGeoView from '$lib/components/explorer/NumGeoView.svelte';
	import {interpolateColor} from '$lib/config/colors.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {
		getCardinalityValue,
		getCertifiedValue,
		getDocCount,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';

	const valueAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: getDocCount,
		installers_certified: getCertifiedValue,
		installers_dropped_certifications: getCertifiedValue,
		installers_new_certifications: getCertifiedValue,
		installers: getCardinalityValue,
	}

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

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
	}
</script>

<NumGeoView
	formatFn={$_currentMetric?.formatFn}
	{interpolateColor}
	{items}
	{makeBarchartItems}
	{makeDomain}
	{title}
	{valueAccessor}
/>
