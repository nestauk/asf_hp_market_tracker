<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {getValue, makeWithKeys} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import {schemeTableau10 as colorScheme} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import DevView from '$lib/components/explorer/DevView.svelte';
	import RegionLevelSelector
		from '$lib/components/explorer/medium/RegionTypeSelector.svelte';
	import Grid3Columns from '$lib/components/svizzle/Grid3Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_barchartsTheme, _legendsTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';

	/* common */

	let domain;
	let colorScale;

	const makeDomain = _.pipe([
		_.filterWith(({agg2}) => agg2?.avg),
		arr => extent(arr, _.getPath('agg2.avg'))
	]);
	const formatFn = num => num?.toFixed(1);

	/* legend */

	let legendBins;

	/* barchart */

	const makeItems = _.pipe([
		_.filterWith(({agg2}) => agg2?.avg),
		_.mapWith(({key, agg2: {avg}}) => ({key, value: avg})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	let barchartItems;

	$: if ($_viewData?.code === 200 && $_viewData?.data.agg1.buckets) {

		/* common */

		domain = makeDomain($_viewData.data.agg1.buckets);
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

		barchartItems = makeItems($_viewData.data.agg1.buckets) || [];
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<RegionLevelSelector />
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
			items={barchartItems}
			shouldResetScroll={true}
			slot='col2'
			theme={$_barchartsTheme}
			title='Average value'
			valueToColorFn={colorScale}
		/>
	</Grid3Columns>
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
