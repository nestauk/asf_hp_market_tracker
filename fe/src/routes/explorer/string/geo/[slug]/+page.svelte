<script>
	import {getKey} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import StringGeoView from '$lib/components/explorer/medium/StringGeoView.svelte';
	import {_viewData} from '$lib/stores/view.js';
	import {getDocCount, getTermsBuckets} from '$lib/utils/getters.js';

	const keyAccessor = getKey;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_viewData?.page.route.id === $_page.route.id;

	let items;

	$: if (proceed) {
		items = $_viewData.response.data.terms?.buckets || [];
	}
</script>

<StringGeoView
	{items}
	{keyAccessor}
	{keyAccessor2}
	{valueAccessor}
	{valueAccessor2}
/>
