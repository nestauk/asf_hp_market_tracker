<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {makeWithKeys} from '@svizzle/utils';
	import {pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import DevView from '$lib/components/explorer/DevView.svelte';
	import RegionLevelSelector
		from '$lib/components/explorer/medium/RegionTypeSelector.svelte';
	import Grid3Columns from '$lib/components/svizzle/Grid3Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_barchartsTheme, _legendsTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';

	export let colorScheme;
	export let formatFn;
	export let items;
	export let makeBarchartItems;
	export let makeDomain;
	export let title;

	let barchartItems;
	let colorScale;
	let doDraw = false;
	let domain;
	let legendBins;

	$: if (items) {

		/* common */

		domain = makeDomain(items);
		colorScale = scaleQuantize().domain(domain).range(colorScheme);

		/* legend */

		const ranges = pairs([
			domain[0],
			...colorScale.thresholds(),
			domain[1]
		]);
		legendBins = _.map(
			_.zip(ranges, colorScheme),
			makeWithKeys(['range', 'color'])
		);

		/* barchart */

		barchartItems = makeBarchartItems(items) || [];

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<RegionLevelSelector />
	{#if doDraw}
		<Grid3Columns
			percents={[10, 60, 30]}
			gap='0.25em'
		>
			<div slot='col0' class='col0'>
				<div class='legend'>
					<ColorBinsDiv
						bins={legendBins}
						flags={{
							isVertical: true,
						}}
						geometry={{
							left: 0,
							right: 20,
						}}
						padding=0
						theme={$_legendsTheme}
						ticksFormatFn={formatFn}
					/>
				</div>
			</div>
			<DevView slot='col1' /> <!-- TODO map -->
			<BarchartVDiv
				{formatFn}
				{title}
				items={barchartItems}
				slot='col2'
				shouldResetScroll={true}
				theme={$_barchartsTheme}
				valueToColorFn={colorScale}
			/>
		</Grid3Columns>
	{/if}
</Grid2Rows>

<style>
	.col0 {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		padding: 0;
	}
	.legend {
		height: 50%;
		width: 100%;
	}
</style>
