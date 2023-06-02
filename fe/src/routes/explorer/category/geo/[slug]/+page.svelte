<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {interpolateYlGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import CatGeoView from '$lib/components/explorer/medium/CatGeoView.svelte';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const keyAccessor = getKey;
	const valueAccessor = _.getPath('agg2.buckets');
	const keyAccessor2 = getKey;
	const valueAccessor2 = _.getKey('doc_count');
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	const makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);
	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	let items;

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_viewData?.page.route.id === $_page.route.id;

	$: proceed && (items = $_viewData.response.data.agg1.buckets);
</script>

<CatGeoView
 	{interpolateColor}
 	{items}
	{keyAccessor}
	{keyAccessor2}
	{makeBarchartItems}
	{makeDomain}
	{valueAccessor}
	{valueAccessor2}
	amountOfBins={10}
	formatFn={roundTo1}
/>
