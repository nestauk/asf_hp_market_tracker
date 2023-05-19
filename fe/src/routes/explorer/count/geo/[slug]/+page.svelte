<script>
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {schemeTableau10 as colorScheme} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import {roundTo1} from '$lib/utils/numbers.js';

	import NumGeoView from '$lib/components/explorer/medium/NumGeoView.svelte';
	// import {_currentMetricId} from '$lib/stores/navigation.js';
	import {_viewData} from '$lib/stores/view.js';

	const valueAccessors = {
		// {key, doc_count, agg2: {buckets: {key, value}[]}, stats2: {avg, ...} }}[]
		installations_per_installer: _.getPath('stats2.avg'),
		installations: _.getPath('doc_count'), // {key, doc_count}[]
		installers: _.getPath('agg2.value'), // {key, doc_count, agg2: {value}}[]
	}

	$: id = $_page.params.slug;
	$: valueAccessor = valueAccessors[id];
	$: filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	$: makeDomain = _.pipe([filter, arr => extent(arr, valueAccessor)]);
	$: makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);
	$: title = id === 'installations_per_installer' ? 'Average' : null;
	$: formatFn = id === 'installations_per_installer' ? roundTo1 : null;

	$: items = $_viewData?.code === 200 && $_viewData?.data.agg1.buckets || [];
</script>

<NumGeoView
	{colorScheme}
	{formatFn}
	{items}
	{makeBarchartItems}
	{makeDomain}
	{title}
/>
