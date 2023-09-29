<script>
	import {
		arraySumWith,
		getKey,
		getValue,
		getValues,
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import SelectorInterval from '$lib/components/explorer/SelectorInterval.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import StreamGraph from '$lib/components/svizzle/trends/StreamGraph.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import {intervalToAxisLabel} from '$lib/config/labels.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {
		_currentMetric,
		_currentMetricTitle,
		_selection
	} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils.js';
	import {
		getDocCount,
		getKeyAsString,
		getTermsBuckets
	} from '$lib/utils/getters.js';

	const keyAccessor = getKeyAsString;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	/* common */

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

	const onDotHovered = ({detail: {
		data: {
			group,
			key,
			value
		},
		x,
		y
	}}) => {
		$_tooltip = {
			key: `${group} @ ${key}`,
			value,
			x,
			y,
		};
	};
	const onAreaHovered = ({detail: {key, x, y}}) => {
		$_tooltip = {key, x, y};
	};

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

	$: axesLabels = [
		{
			label: intervalToAxisLabel[$_selection.interval],
			areas: ['bottom']
		},
		{
			label: $_currentMetricTitle,
			areas: ['left']
		},
	];

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

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='trends'>
			<GridRows rowLayout='min-content 1fr min-content'>
				<MetricTitle />

				{#if $_selection.categsTimeGraph === 'streams'}
					<StreamGraph
						{axesLabels}
						{groups}
						{groupToColorFn}
						{points}
						{valueFormatFn}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyType='date'
						on:areaTouchStarted={onAreaHovered}
						sorting={$_selection.categsStreamgraphsSorting}
						theme={$_framesTheme}
					/>
				{:else}
					<Trends
						{axesLabels}
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
						on:dotTouchStarted={onDotHovered}
						slot='col1'
						theme={{
							...$_framesTheme,
							curveStroke: $_currThemeVars['--colorBorderAux']
						}}
					/>
				{/if}

				<FlexBar
					canWrap={true}
					shouldWrapUp={true}
				>
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
			</GridRows>

		</View>

		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<div class='small_legend'>
					<KeysLegend
						keyToColorFn={groupToColorFn}
						keys={groups}
					/>
				</div>

			</GridRows>
		</View>
	{/if}
{:else}
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
				percents={[85, 15]}
				gap='0.5em'
			>
				<div class='col0' slot='col0'>
					{#if $_selection.categsTimeGraph === 'streams'}
						<StreamGraph
							{axesLabels}
							{groups}
							{groupToColorFn}
							{points}
							{valueFormatFn}
							geometry={{
								safetyBottom: 50,
								safetyLeft: 80,
								safetyRight: 80,
								safetyTop: 50,
							}}
							keyType='date'
							on:areaHovered={onAreaHovered}
							on:areaExited={clearTooltip}
							sorting={$_selection.categsStreamgraphsSorting}
							theme={$_framesTheme}
						/>

					{:else}
						<Trends
							{axesLabels}
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
							on:dotHovered={onDotHovered}
							on:dotExited={clearTooltip}
							slot='col1'
							theme={{
								...$_framesTheme,
								curveStroke: $_currThemeVars['--colorBorderAux']
							}}
						/>
					{/if}
				</div>

				<div
					class='legend'
					slot='col1'
				>
					<KeysLegend
						keyToColorFn={groupToColorFn}
						keys={groups}
					/>
				</div>
			</Grid2Columns>
		{/if}
	</Grid2Rows>
{/if}

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

	.col0 {
		height: 100%;
		width: 100%;
	}

	.small_legend {
		text-align: center;
	}
	.two_rows {
		display: grid;
		grid-template-rows: 1fr min-content;
		height: 100%;
		width: 100%;
		overflow: hidden;
	}
</style>
