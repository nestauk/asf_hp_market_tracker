<script>
	import {
		arraySumWith,
		getKey,
		getValue,
		getValues,
		makeSplitBy,
		sliceStringAt
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectionXor
		from '$lib/components/explorer/medium/SelectionXor.svelte';
	import SelectorInterval from '$lib/components/explorer/medium/SelectorInterval.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import StreamGraph from '$lib/components/svizzle/trends/StreamGraph.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils.js';
	import {
		getDocCount,
		getKeyAsString,
		getTermsBuckets
	} from '$lib/utils/getters.js';
	import {formatDate} from '$lib/utils/date.js';

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
		_.sortWith()
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
	const valueFormatFn = Math.round;

	let doDraw = false;
	let groups;
	let groupToColorFn;
	let points;
	let trends;

	$: showStreams = $_selection.categsTimeGraph === 'streams';
	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram.buckets || [];
		const allPoints = flattenItems(rawItems);

		trends = getTrends(allPoints);
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
		<SelectorInterval />
		<SelectionXor
			name='categsTimeGraph'
			values={['trends', 'streams']}
		/>
		{#if showStreams}
			<SelectionXor
				name='categsStreamgraphsSorting'
				values={['off', 'asc', 'desc']}
			/>
		{/if}
	</FlexBar>
	{#if doDraw}
		<Grid2Columns
			percents={[15, 85]}
			gap='0.5em'
		>
			<div
				class='legend'
				slot='col0'
			>
				<ul>
					{#each groups as group}
						<li>
							<span
								class='dot'
								style='background-color:{groupToColorFn(group)}'
							></span>
							<span>{group}</span>
						</li>
					{/each}
				</ul>
			</div>
			<div class='col1' slot='col1'>
				{#if $_selection.categsTimeGraph === 'streams'}
					<StreamGraph
						{groups}
						{groupToColorFn}
						{keyFormatFn}
						{points}
						{valueFormatFn}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyType='date'
						preformatDate={formatDate}
						sorting={$_selection.categsStreamgraphsSorting}
						theme={$_framesTheme}
					/>

				{:else}
					<Trends
						{keyFormatFn}
						{trends}
						{valueFormatFn}
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
		height: 95%;
		width: 100%;
	}
</style>
