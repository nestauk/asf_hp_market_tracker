<script>
	import {
		applyFnMap,
		getValue,
		isNotNil,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import SelectorInterval from '$lib/components/explorer/SelectorInterval.svelte';
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
	import {
		getCardinalityValue,
		getCertifiedValue,
		getDocCount,
		getKeyAsString,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';

	const keyAccessor = getKeyAsString;
	const valueAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: getDocCount,
		installers_certified: getCertifiedValue,
		installers_dropped_certifications: getCardinalityValue,
		installers_new_certifications: getCardinalityValue,
		installers: getCardinalityValue,
	}
	const filterOutNils = _.filterWith(_.pipe([getValue, isNotNil]));

	const onDotEntered = ({detail: {data, x, y}}) => {
		const {key, value} = data;
		hero = data;
		$_tooltip = {
			key: `@ ${key}`,
			value,
			x,
			y,
		};
	};

	const clearHero = () => {
		hero = null;
	}
	const clearHeroAndTooltip = () => {
		clearHero();
		clearTooltip();
	}

	let doDraw = false;
	let hero;
	let trends;
	let valueFormatFn;

	$: !$_tooltip && clearHero();

	$: trendType = $_currentMetric.isCumulative
		? $_selection.trendType
		: 'progressive';

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

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram.buckets || [];

		const valueAccessor = valueAccessors[$_currentMetric?.id];
		const reshapeItems = _.mapWith(
			applyFnMap({
				key: keyAccessor,
				value: valueAccessor,
			})
		);
		const trend = filterOutNils(reshapeItems(rawItems));
		trends = [{key: 'trend', values: trend}];

		valueFormatFn = $_currentMetric?.formatFn ?? _.identity;

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='trends'>
			<GridRows rowLayout='min-content 1fr min-content'>
				<MetricTitle />

				<Trends
					{axesLabels}
					{hero}
					{trends}
					{trendType}
					{valueFormatFn}
					geometry={{
						safetyBottom: 50,
						safetyLeft: 80,
						safetyRight: 80,
						safetyTop: 50,
					}}
					keyType='date'
					on:dotExited={clearHeroAndTooltip}
					on:dotHovered={onDotEntered}
					on:dotTouchStarted={onDotEntered}
					theme={{
						...$_framesTheme,
						curveStroke: $_currThemeVars['--colorBorderAux']
					}}
				/>

				<FlexBar canWrap shouldWrapUp>
					<SelectorInterval />

					{#if $_currentMetric.isCumulative}
						<SelectionXor
							name='trendType'
							valuesToLabels={{
								progressive: 'Progressive',
								cumulative: 'Cumulative',
							}}
						/>
					{/if}
				</FlexBar>
			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content 1fr'>
		<FlexBar>
			<SelectorInterval />

			{#if $_currentMetric.isCumulative}
				<SelectionXor
					name='trendType'
					valuesToLabels={{
						progressive: 'Progressive',
						cumulative: 'Cumulative',
					}}
				/>
			{/if}
		</FlexBar>

		{#if doDraw}
			<Trends
				{axesLabels}
				{hero}
				{trends}
				{trendType}
				{valueFormatFn}
				geometry={{
					safetyBottom: 50,
					safetyLeft: 80,
					safetyRight: 80,
					safetyTop: 50,
				}}
				keyType='date'
				on:dotExited={clearHeroAndTooltip}
				on:dotHovered={onDotEntered}
				on:dotTouchStarted={onDotEntered}
				theme={{
					...$_framesTheme,
					curveStroke: $_currThemeVars['--colorBorderAux']
				}}
			/>
		{/if}
	</GridRows>
{/if}
