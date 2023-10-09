<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import NumGeoView from '$lib/components/explorer/NumGeoView.svelte';
	import {interpolateColor} from '$lib/config/colors.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getStatsAvg} from '$lib/utils/getters.js';

	const valueAccessor = getStatsAvg;

	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	const makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);
	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let items;

	$: if (proceed) {
		items = $_viewData?.response.data.terms?.buckets || [];
	}
</script>

<NumGeoView
	{interpolateColor}
	{items}
	{makeBarchartItems}
	{makeDomain}
	{valueAccessor}
	amountOfBins={5}
	formatFn={$_currentMetric?.formatFn}
/>
