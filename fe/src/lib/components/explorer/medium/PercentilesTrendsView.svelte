<script>
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import StatsTrends from '$lib/components/svizzle/trends/StatsTrends.svelte';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_framesTheme} from '$lib/stores/theme.js';

	export let items;
	export let keyFormatFn;
	export let valueFormatFn;

	$: items = items ?? [];

	const areas = [
		['0', '1'],
		['1', '5'],
		['5', '25'],
		['25', '50'],
		['50', '75'],
		['75', '95'],
		['95', '99'],
		['99', '100'],
	];
	const colorScheme = _.map(
		areas,
		(v, index) => interpolateColor(index / (areas.length - 1))
	);
	const avgTrendColor = 'magenta';

	const areaLegendKeys = _.map(
		_.reverse(areas),
		([lowKey, highKey]) => `${lowKey}% - ${highKey}%`
	);
	const areaLowKeyToColor =
		scaleOrdinal()
		.domain(_.map(areas, _.head))
		.range(colorScheme);
	const areaLegendKeysToColor =
		scaleOrdinal()
		.domain(areaLegendKeys)
		.range(colorScheme);
</script>

{#if $_isSmallScreen}
	<GridRows rowLayout='1fr 2fr'>
		<Scroller>
			<div class='legend'>
				<div class='legendBlock'>
					<h3>Trends</h3>
					<KeysLegend
						keyToColorFn={_.always(avgTrendColor)}
						keys={['Average']}
					/>
				</div>
				<div class='legendBlock'>
					<h3>Percentiles</h3>
					<KeysLegend
						keyToColorFn={areaLegendKeysToColor}
						keys={areaLegendKeys}
					/>
				</div>
			</div>
		</Scroller>

		<StatsTrends
			{areaLowKeyToColor}
			{items}
			{keyFormatFn}
			{valueFormatFn}
			config={{areas, trends: ['avg']}}
			geometry={{
				safetyBottom: 50,
				safetyLeft: 80,
				safetyRight: 80,
				safetyTop: 50,
			}}
			keyType='date'
			theme={{
				...$_framesTheme,
				curveStroke: avgTrendColor
			}}
		/>
	</GridRows>
{:else}
	<Grid2Columns
		percents={[15, 85]}
		gap='0.5em'
	>
		<!-- slot -->

		<div
			class='legend'
			slot='col0'
		>
			<div class='legendBlock'>
				<h3>Trends</h3>
				<KeysLegend
					keyToColorFn={_.always(avgTrendColor)}
					keys={['Average']}
				/>
			</div>
			<div class='legendBlock'>
				<h3>Percentiles</h3>
				<KeysLegend
					keyToColorFn={areaLegendKeysToColor}
					keys={areaLegendKeys}
				/>
			</div>
		</div>

		<!-- slot -->

		<StatsTrends
			{areaLowKeyToColor}
			{items}
			{keyFormatFn}
			{valueFormatFn}
			config={{areas, trends: ['avg']}}
			geometry={{
				safetyBottom: 50,
				safetyLeft: 80,
				safetyRight: 80,
				safetyTop: 50,
			}}
			keyType='date'
			slot='col1'
			theme={{
				...$_framesTheme,
				curveStroke: avgTrendColor
			}}
		/>
	</Grid2Columns>
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

	.col1 {
		height: 95%;
		width: 100%;
	}
</style>
