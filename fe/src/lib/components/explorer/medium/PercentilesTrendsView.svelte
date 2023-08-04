<script>
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import StatsTrends from '$lib/components/svizzle/trends/StatsTrends.svelte';
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
	const areaLowKeyToColor =
		scaleOrdinal()
		.domain(_.map(areas, _.head))
		.range(colorScheme);
	const avgTrendColor = 'magenta';

	const trendLegendItems = [{color: avgTrendColor, label: 'Average'}];
	const areaLegendItems = _.map(
		_.reverse(areas),
		([lowKey, highKey]) => {
			const lowKeyString =
				['min', 'max'].includes(lowKey) ? lowKey : `${lowKey}%`;
			const highKeyString =
				['min', 'max'].includes(highKey) ? highKey : `${highKey}%`;
			const label = `${lowKeyString} - ${highKeyString}`;

			return {
				color: areaLowKeyToColor(lowKey),
				label
			}
		}
	);
</script>

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
			<ul>
				{#each trendLegendItems as {color, label}}
					<li>
						<span
							class='dot'
							style='background-color:{color};border:thin solid var(--colorBorder);'
						></span>
						<span>{label}</span>
					</li>
				{/each}
			</ul>
		</div>
		<div class='legendBlock'>
			<h3>Percentiles</h3>
			<ul>
				{#each areaLegendItems as {color, label}}
					<li>
						<span
							class='dot'
							style='background-color:{color}'
						></span>
						<span>{label}</span>
					</li>
				{/each}
			</ul>
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
