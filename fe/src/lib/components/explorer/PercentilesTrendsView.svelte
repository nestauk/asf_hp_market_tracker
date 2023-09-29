<script>
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import StatsTrends from '$lib/components/svizzle/trends/StatsTrends.svelte';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_framesTheme} from '$lib/stores/theme.js';

	export let items;
	export let keyFormatFn;
	export let valueFormatFn;

	$: items = items ?? [];

	const areas = [
		['min', '1.0'],
		['1.0', '5.0'],
		['5.0', '25.0'],
		['25.0', '50.0'],
		['50.0', '75.0'],
		['75.0', '95.0'],
		['95.0', '99.0'],
		['99.0', 'max'],
	];
	const colorScheme = _.map(
		areas,
		(v, index) => interpolateColor(index / (areas.length - 1))
	);
	const avgTrendColor = 'magenta';

	const areaLegendKeys = _.map(
		areas,
		([lowKey, highKey]) => {
			const lowKeyString =
				['min', 'max'].includes(lowKey)
					? '0%'
					: `${lowKey.replace('.0', '')}%`;
			const highKeyString =
				['min', 'max'].includes(highKey)
				? '100%'
				: `${highKey.replace('.0', '')}%`;
			const label = `${lowKeyString} - ${highKeyString}`;

			return label;
		}
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
	<GridRows rowLayout='1fr 3fr'>
		<div class='smallLegend'>
			<h3 style:grid-area='avgTitle'>Trends</h3>
			<div style:grid-area='avg'>
				<KeysLegend
					keyToColorFn={_.always(avgTrendColor)}
					keys={['Average']}
				/>
			</div>
			<h3 style:grid-area='percentTitle'>Percentiles</h3>
			<div style:grid-area='percentiles1'>
				<KeysLegend
					keyToColorFn={areaLegendKeysToColor}
					keys={_.takeFrom(areaLegendKeys, 4)}
				/>
			</div>
			<div style:grid-area='percentiles2'>
				<KeysLegend
					keyToColorFn={areaLegendKeysToColor}
					keys={_.dropFrom(areaLegendKeys, 4)}
				/>
			</div>
		</div>

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
			on:areaTouchStarted
			on:areaHovered
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
			on:areaHovered
			on:areaExited
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
		height: 100%;
		width: 100%;
	}

	.smallLegend {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: min-content 1fr;
		grid-template-areas:
			"avgTitle percentTitle percentTitle"
			"avg percentiles1 percentiles2";
	}
</style>
