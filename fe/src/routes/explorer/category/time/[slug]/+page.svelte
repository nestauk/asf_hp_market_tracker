<script>
	import {Scroller} from '@svizzle/ui';
	import {
		arraySumWith,
		getKey,
		getValue,
		getValues,
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import SelectorInterval from '$lib/components/explorer/SelectorInterval.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import StreamGraph from '$lib/components/svizzle/trends/StreamGraph.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import {intervalToAxisLabel} from '$lib/config/labels.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getItemsColorScheme} from '$lib/utils/color.js';
	import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils.js';
	import {
		getDocCount,
		getKeyAsString,
		getTermsBuckets
	} from '$lib/utils/getters.js';
	import {getSorters} from '$lib/utils/ordering.js';

	let doDraw = false;
	let groups;
	let groupToColorFn;
	let hero;
	let points;
	let trends;

	const keyAccessor = getKeyAsString;
	const valueAccessor = getTermsBuckets;
	const keyAccessor2 = getKey;
	const valueAccessor2 = getDocCount;

	/* common */

	const flattenItems = _.flatMapWith(
		_.pipe([
			_.collect([keyAccessor, valueAccessor]),
			([key, points_]) => _.map(points_,
				point => ({
					group: keyAccessor2(point),
					key,
					value: valueAccessor2(point),
				})
			)
		])
	); // {group, key, value}[]

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

	const onDotEntered = ({detail: {data, x, y}}) => {
		const {group, key, value} = data;
		hero = data;
		$_tooltip = {
			key: `${group} @ ${key}`,
			value,
			x,
			y,
		}
	}

	const clearHero = () => {
		hero = null;
	}
	const clearHeroAndTooltip = () => {
		clearHero();
		clearTooltip();
	}

	const onAreaEntered = ({detail: {key, x, y}}) => {
		$_tooltip = {key, x, y};
	}

	$: !$_tooltip && clearHero();

	$: showStreams = $_selection.categsTimeGraph === 'streams';
	$: sortGroups = getSorters($_currentMetric?.id).keySorter;

	// {group, key, value}[] => group[]
	$: getGroups = _.pipe([_.pluck('group'), _.uniques, sortGroups]);

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	$: axesLabels = [
		{
			gridAreas: ['bottom'],
			label: `Time (sampled ${intervalToAxisLabel[$_selection.interval]})`,
		},
		{
			gridAreas: ['left'],
			label: 'Number of installations',
		},
	];

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram.buckets || [];
		const allPoints = flattenItems(rawItems);

		trends = getTrends(allPoints);
		points = getTrendsPoints(trends);

		groups = getGroups(points);

		const colorScheme = getItemsColorScheme(groups);
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
						on:areaTouchStarted={onAreaEntered}
						on:areaHovered={onAreaEntered}
						on:areaExited={clearTooltip}
						sorting={$_selection.categsStreamgraphsSorting}
						theme={$_framesTheme}
					/>
				{:else}
					<Trends
						{axesLabels}
						{hero}
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
						on:dotHovered={onDotEntered}
						on:dotExited={clearHeroAndTooltip}
						on:dotTouchStarted={onDotEntered}
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
						valuesToLabels={{
							trends: 'Trends',
							streams: 'Streams'
						}}
					/>
					{#if showStreams}
						<SelectionXor
							name='categsStreamgraphsSorting'
							valuesToLabels={{
								off: 'Off',
								asc: 'Asc',
								desc: 'Desc',
							}}
						/>
					{/if}
				</FlexBar>
			</GridRows>

		</View>

		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Scroller
					alignHorizontally={true}
					alignVertically={true}
				>
					<KeysLegend
						keyToColorFn={groupToColorFn}
						keys={groups}
					/>
				</Scroller>

			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content 1fr'>
		<FlexBar>
			<SelectorInterval />
			<SelectionXor
				name='categsTimeGraph'
				valuesToLabels={{
					trends: 'Trends',
					streams: 'Streams'
				}}
			/>
			{#if showStreams}
				<SelectionXor
					name='categsStreamgraphsSorting'
					valuesToLabels={{
						off: 'Off',
						asc: 'Asc',
						desc: 'Desc',
					}}
				/>
			{/if}
		</FlexBar>

		{#if doDraw}
			<GridColumns
				colLayout='84% 15%'
				gap='1%'
			>
				<div class='col'>
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
							on:areaHovered={onAreaEntered}
							on:areaExited={clearTooltip}
							on:areaTouchStarted={onAreaEntered}
							sorting={$_selection.categsStreamgraphsSorting}
							theme={$_framesTheme}
						/>
					{:else}
						<Trends
							{axesLabels}
							{hero}
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
							on:dotHovered={onDotEntered}
							on:dotExited={clearHeroAndTooltip}
							on:dotTouchStarted={onDotEntered}
							theme={{
								...$_framesTheme,
								curveStroke: $_currThemeVars['--colorBorderAux']
							}}
						/>
					{/if}
				</div>

				<Scroller alignVertically={true}>
					<KeysLegend
						keyToColorFn={groupToColorFn}
						keys={groups}
					/>
				</Scroller>
			</GridColumns>
		{/if}
	</GridRows>
{/if}

<style>
	.col {
		height: 100%;
		width: 100%;
	}
</style>
