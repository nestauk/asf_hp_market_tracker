<script>
	import {
		applyFnMap,
		getKey,
		isNotNil,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import PercentilesTrendsView
		from '$lib/components/explorer/PercentilesTrendsView.svelte';
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import SelectorInterval from '$lib/components/explorer/SelectorInterval.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
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
	import {getKeyAsString} from '$lib/utils/getters.js';

	const keyAccessor = getKeyAsString;
	const valueAccessor = _.pipe([
		_.collect([_.getKey('stats'), _.getPath('percentiles.values')]),
		_.apply(_.merge),
		_.skip(['count', 'sum']),
	]);
	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			values: valueAccessor,
		})
	);
	const filterItems = _.filterWith(
		_.pipe([_.getPath('values.avg'), isNotNil])
	);

	const onDotHovered = ({detail: {data, x, y}}) => {
		const {key, value} = data;
		hero = data;
		$_tooltip = {
			key: `@ ${key}`,
			value,
			x,
			y,
		};
	};
	const onAreaHovered = ({detail: {key, x, y}}) => {
		$_tooltip = {key, x, y};
	};

	const clearHero = () => {
		hero = null;
	}
	const clearHeroAndTooltip = () => {
		clearHero();
		clearTooltip();
	}

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	$: axesLabels = [
		{
			areas: ['bottom'],
			label: `Time (sampled ${intervalToAxisLabel[$_selection.interval]})`,
		},
		{
			areas: ['left'],
			label: $_currentMetricTitle,
		},
	];

	let doDraw = false;
	let hero;
	let items;
	let trends;

	$: !$_tooltip && clearHero();

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram?.buckets || [];
		items = filterItems(reshapeItems(rawItems));

		if ($_selection.numTimeGraph !== 'percentiles') {
			trends = [{
				key: 'Average',
				values: _.map(
					items,
					applyFnMap({
						key: getKey,
						value: _.getPath('values.avg'),
					})
				)
			}];
		}

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='trends'>
			<GridRows rowLayout='min-content 1fr min-content'>
				<MetricTitle />

				{#if $_selection.numTimeGraph === 'percentiles'}
					<PercentilesTrendsView
						{axesLabels}
						{items}
						on:areaTouchStarted={onAreaHovered}
						valueFormatFn={$_currentMetric?.formatFn}
					/>
				{:else}
					<Trends
						{axesLabels}
						{hero}
						{trends}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyType='date'
						on:dotTouchStarted={onDotHovered}
						theme={{
							...$_framesTheme,
							curveStroke: $_currThemeVars['--colorBorderAux']
						}}
						valueFormatFn={$_currentMetric?.formatFn}
					/>
				{/if}

				<FlexBar canWrap shouldWrapUp>
					<SelectorInterval />
					<SelectionXor
						name='numTimeGraph'
						valuesToLabels={{
							percentiles: 'Percentiles',
							average: 'Average',
						}}
					/>
				</FlexBar>
			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content'>
		<FlexBar>
			<SelectorInterval />
			<SelectionXor
				name='numTimeGraph'
				valuesToLabels={{
					percentiles: 'Percentiles',
					average: 'Average',
				}}
			/>
		</FlexBar>

		{#if doDraw}
			{#if $_selection.numTimeGraph === 'percentiles'}
				<PercentilesTrendsView
					{axesLabels}
					{items}
					on:areaHovered={onAreaHovered}
					on:areaExited={clearTooltip}
					valueFormatFn={$_currentMetric?.formatFn}
			/>
			{:else}
				<Trends
					{axesLabels}
					{hero}
					{trends}
					geometry={{
						safetyBottom: 50,
						safetyLeft: 80,
						safetyRight: 80,
						safetyTop: 50,
					}}
					keyType='date'
					on:dotHovered={onDotHovered}
					on:dotExited={clearHeroAndTooltip}
					theme={{
						...$_framesTheme,
						curveStroke: $_currThemeVars['--colorBorderAux']
					}}
					valueFormatFn={$_currentMetric?.formatFn}
				/>
			{/if}
		{/if}
	</GridRows>
{/if}

<style>
	.legend {
		align-items: start;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-evenly;
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
	h3 {
		padding: 0.25em;
	}
</style>
