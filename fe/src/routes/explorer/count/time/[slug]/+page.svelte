<script>
	import {
		applyFnMap,
		getValue,
		isNotNil,
		makeSplitBy,
		sliceStringAt,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import {_currentMetricId} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';
	import {formatDate} from '$lib/utils/date.js';

	const keyAccessor  = _.getPath('key_as_string');
	const valueAccessors = {
		// {key, doc_count, agg2: {...}, stats2: {avg, ...} }}[]
		installations_per_installer: _.getPath('stats2.avg'),
		installations: _.getKey('doc_count'), // {key, doc_count}[]
		installers: _.getPath('agg2.value'), // {key, doc_count, agg2: {value}}[]
	}
	const filterOutNils = _.filterWith(_.pipe([getValue, isNotNil]));
	const keyFormatFn = _.pipe([
		makeSplitBy('-'),
		_.getAt(0),
		sliceStringAt([2, 4])
	]);

	let doDraw = false;
	let items;

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_page.route.id === $_viewData?.page.route.id &&
		$_page.params.slug === $_viewData?.page.params.slug;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.agg1.buckets;
		const valueAccessor = valueAccessors[$_currentMetricId];
		const reshapeItems = _.mapWith(
			applyFnMap({
				key: keyAccessor,
				value: valueAccessor,
			})
		);
		const trend = filterOutNils(reshapeItems(rawItems));
		items = [{key: 'trend', values: trend}];
		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<TemporalOptions />

	{#if doDraw}
		<Trends
			{items}
			{keyFormatFn}
			geometry={{
				safetyBottom: 50,
				safetyLeft: 80,
				safetyRight: 80,
				safetyTop: 50,
			}}
			keyType='date'
			preformatDate={formatDate}
			theme={{
				...$_framesTheme,
				curveStroke: $_currThemeVars['--colorBorderAux']
			}}
			valueFormatFn={roundTo1}
		/>
	{/if}
</Grid2Rows>
