<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {interpolateYlGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import NumGeoView from '$lib/components/explorer/medium/NumGeoView.svelte';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const valueAccessor = _.getPath('agg2.avg');
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	const makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);
	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);
	$: items = $_viewData?.code === 200 && $_viewData?.data.agg1.buckets || [];
</script>

<NumGeoView
	{interpolateColor}
	{items}
	{makeBarchartItems}
	{makeDomain}
	{valueAccessor}
	amountOfBins={5}
	formatFn={roundTo1}
/>
