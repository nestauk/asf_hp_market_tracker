<script>
	import {getKey} from '@svizzle/utils';

	import {page as _page} from '$app/stores';
	import CatGeoView from '$lib/components/explorer/CatGeoView.svelte';
	import {interpolateColor} from '$lib/config/colors.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getDocCount, getTermsBuckets} from '$lib/utils/getters.js';

	const keyAccessor = getKey;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let items;

	$: if (proceed) {
		items = proceed && $_viewData?.response.data.terms?.buckets || [];
	}
</script>

<CatGeoView
	{interpolateColor}
	{items}
	{keyAccessor}
	{keyAccessor2}
	{valueAccessor}
	{valueAccessor2}
	formatFn={$_currentMetric?.formatFn}
/>
