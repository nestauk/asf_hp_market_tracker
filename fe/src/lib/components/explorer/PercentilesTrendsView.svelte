<script>
	// import {Scroller} from '@svizzle/ui';
	import {scaleOrdinal} from 'd3-scale';
	import * as _ from 'lamb';

	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import StatsTrends from '$lib/components/svizzle/trends/StatsTrends.svelte';
	import Scroller from '$lib/components/svizzle/ui/Scroller.svelte';
	import {interpolateColor} from '$lib/config/colors.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_framesTheme} from '$lib/stores/theme.js';

	export let axesLabels;
	export let items;
	export let keyFormatFn = null;
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

			<!-- average trend legend -->

			<section class='legendAvg'>
				<header class='h3'>
					Trends
				</header>
				<KeysLegend
					keyToColorFn={_.always(avgTrendColor)}
					keys={['Average']}
				/>
			</section>

			<!-- percentiles legend -->

			<section class='legendPercent'>
				<header
					class='h3'
					style:grid-area='title'
				>
					Percentiles
				</header>
				<KeysLegend
					keys={_.takeFrom(areaLegendKeys, 4)}
					keyToColorFn={areaLegendKeysToColor}
				/>
				<KeysLegend
					keys={_.dropFrom(areaLegendKeys, 4)}
					keyToColorFn={areaLegendKeysToColor}
				/>
			</section>
		</div>

		<StatsTrends
			{axesLabels}
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
			on:areaExited
			on:areaHovered
			on:areaTouchStarted
			theme={{
				...$_framesTheme,
				curveStroke: avgTrendColor
			}}
		/>
	</GridRows>
{:else}
	<GridColumns
		colLayout='84% 15%'
		gap='1%'
	>
		<StatsTrends
			{axesLabels}
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
			on:areaExited
			on:areaHovered
			on:areaTouchStarted
			theme={{
				...$_framesTheme,
				curveStroke: avgTrendColor
			}}
		/>

		<Scroller alignVertically={true}>
			<div class='legend'>

				<!-- average trend legend -->

				<section class='legendBlock'>
					<header
						class='h3'
						style:grid-area='percentTitle'
					>
						Trends
					</header>
					<KeysLegend
						keys={['Average']}
						keyToColorFn={_.always(avgTrendColor)}
					/>
				</section>

				<!-- percentiles legend -->

				<section class='legendBlock'>
					<header
						class='h3'
						style:grid-area='percentTitle'
					>
						Percentiles
					</header>
					<KeysLegend
						keys={areaLegendKeys}
						keyToColorFn={areaLegendKeysToColor}
					/>
				</section>
			</div>
		</Scroller>
	</GridColumns>
{/if}

<style>
	.legend {
		align-items: start;
		display: flex;
		flex-direction: column;
		height: min-content;
		justify-content: space-evenly;
		min-height: 100%;
		padding: 0;
		width: 100%;
	}
	.h3 {
		font-size: 1.2em;
		padding: 0.25em;
	}

	.smallLegend {
		display: grid;
		grid-template-areas: 'legendAvg legendPercent';
		grid-template-columns: 1fr 2fr;
	}
	.legendAvg {
		display: grid;
		grid-template-rows: min-content 1fr;
	}
	.legendPercent {
		display: grid;
		grid-template-areas:
			'title title'
			'legend1 legend2';
		grid-template-rows: min-content 1fr;
	}
</style>
