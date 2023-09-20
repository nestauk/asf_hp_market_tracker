<script>
	import {getKey, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {interpolateYlGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import CatGeoView2 from '$lib/components/explorer/CatGeoView2.svelte';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getDocCount, getTermsBuckets} from '$lib/utils/getters.js';

	const keyAccessor = getKey;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	const makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);

/* 	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);
 */
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

<CatGeoView2
	{interpolateColor}
	{items}
	{keyAccessor}
	{keyAccessor2}
	{makeDomain}
	{valueAccessor}
	{valueAccessor2}
	formatFn={$_currentMetric?.formatFn}
/>
