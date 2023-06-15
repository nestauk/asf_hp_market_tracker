<script>
	import {
		arraySumWith,
		getKey,
		getValue,
		getValues,
		makeSplitBy,
		sliceStringAt,
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectorInterval from '$lib/components/explorer/medium/SelectorInterval.svelte';
	import SelectorStringsStreamgraphSort from '$lib/components/explorer/medium/SelectorStringsStreamgraphSort.svelte';
	import SelectorStringsTimegraph from '$lib/components/explorer/medium/SelectorStringsTimegraph.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import StreamGraph from '$lib/components/svizzle/trends/StreamGraph.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {formatDate} from '$lib/utils/date.js';
	import {
		getDocCount,
		getKeyAsString,
		getTermsBuckets
	} from '$lib/utils/getters.js';
	import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils.js';

	const keyAccessor = getKeyAsString;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	/* common */

	const keyFormatFn = _.pipe([
		makeSplitBy('-'),
		_.getAt(0),
		sliceStringAt([2, 4])
	]);

	const flattenItems = _.flatMapWith(
		_.pipe([
			_.collect([keyAccessor, valueAccessor]),
			([key, points]) => _.map(points,
				point => ({
					group: keyAccessor2(point),
					key,
					value: valueAccessor2(point),
				})
			)
		])
	); // {group, key, value}[]

	// {group, key, value}[] => group[]
	const getGroups = _.pipe([
		_.pluck('group'),
		_.uniques,
		_.sortWith([])
	]);

	/* trends */

	const getItemSum = _.pipe([getValues, arraySumWith(getValue)]);
	const getTrends = _.pipe([
		_.groupBy(_.getKey('group')),
		objectToKeyValuesArray,
		_.sortWith([_.sorterDesc(getItemSum)]),
	]);
	const getTrendsPoints = _.pipe([
		_.flatMapWith(getValues),
		_.sortWith([getKey]),
	]);

	$: cropTrends = _.take($_selection.stringsTopCount);
	$: showStreams = $_selection.stringsTimeGraph === 'streams';
	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let doDraw = false;
	let groups;
	let groupToColorFn;
	let points;
	let trends;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram?.buckets || [];
		const allPoints = flattenItems(rawItems);
		trends = cropTrends(getTrends(allPoints));
		points = getTrendsPoints(trends);
		groups = getGroups(points);

		const colorScheme = _.map(
			groups,
			(v, index) => interpolateColor(index / (groups.length - 1))
		);
		groupToColorFn = scaleOrdinal().domain(groups).range(colorScheme);

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<FlexBar>
		<SelectorInterval/>
		<SelectorStringsTimegraph/>
		{#if showStreams}
			<SelectorStringsStreamgraphSort />
		{/if}
	</FlexBar>

	{#if doDraw}
		<Grid2Columns
			percents={[20, 80]}
			gap='0.5em'
		>
			<div
				class='legend'
				slot='col0'
			>
				<ul>
					{#each groups as group}
						<li>
							<!-- FIXME -->
							<span
								class='dot'
								style='background-color:{groupToColorFn(group)}'
							></span>
							<span>{group}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div
				class='col1'
				slot='col1'
			>
				{#if showStreams}
					<StreamGraph
						{groups}
						{groupToColorFn}
						{keyFormatFn}
						{points}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyType='date'
						preformatDate={formatDate}
						sorting={$_selection.stringsStreamgraphsSorting}
						theme={$_framesTheme}
						valueFormatFn={Math.round}
					/>
				{:else}
					<Trends
						{keyFormatFn}
						{trends}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyToColorFn={groupToColorFn}
						keyType='date'
						preformatDate={formatDate}
						slot='col1'
						theme={{
							...$_framesTheme,
							curveStroke: $_currThemeVars['--colorBorderAux']
						}}
						valueFormatFn={Math.round}
					/>
				{/if}
			</div>
		</Grid2Columns>
	{/if}
</Grid2Rows>

<style>
	.legend {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		padding: 0;
	}
	ul {
		overflow-y: auto;
	}
	li {
		align-items: center;
		display: flex;
		padding: 0.25em;
	}
	.dot {
		border-radius: 50%;
		margin-right: 0.5em;
		min-height: 1em;
		min-width: 1em;
	}

	.col1 {
		height: 100%;
		width: 100%;
	}
</style>
