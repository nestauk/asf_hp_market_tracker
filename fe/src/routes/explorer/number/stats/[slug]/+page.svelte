<script>
	import {HistogramDiv} from '@svizzle/histogram';
	import {getKey} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleLinear} from 'd3-scale';
	import {interpolateGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import DevView from '$lib/components/explorer/DevView.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import {_viewData} from '$lib/stores/view.js';
	import {_histogramsTheme} from '$lib/stores/theme.js';

	let bins;
	let binsFill;
	let doDraw = false;
	let items;

	const valueAccessor = _.getKey('doc_count');
	const getBins = ({items, interval, valueAccessor}) => {
		let itemsPairs = pairs(items);
		const [, lastPair2] = _.last(itemsPairs);
		let bins = _.map(
			itemsPairs,
			([pair1, pair2]) => ({
				range: [pair1.key, pair2.key],
				value: valueAccessor(pair1)
			})
		).concat({
			range: [lastPair2.key, lastPair2.key + interval],
			value: valueAccessor(lastPair2)
		});

		return bins;
	}

	const makeDomain = _.pipe([arr => extent(arr, getKey)]);

	$: if ($_viewData?.code === 200 && $_viewData?.meta) {
		items = $_viewData?.data.agg1.buckets;

		const {interval} = $_viewData?.meta;
		console.log('items, interval', items, interval);

		/* colors */

		const domain = makeDomain(items);
		const tScale = scaleLinear().domain(domain).range([0, 1]);
		const colorScale = num => interpolateColor(tScale(num));

		/* histogram */

		bins = getBins({items, interval, valueAccessor});
		binsFill = _.map(bins, ({range}) => colorScale(range[0]));
		console.log(bins)

		doDraw = true;
	}
</script>

{#if doDraw}
	<Grid2Columns
		percents={[70, 30]}
		gap='0.5em'
	>
		<div slot='col0' class='col'>
			<!-- <div class='treemap'> -->
				<DevView/>
			<!-- </div> -->
		</div>
		<div slot='col1' class='col'>
			<div class='histogram'>
				<HistogramDiv
					{bins}
					{binsFill}
					geometry={{
						safetyXTicks: 100,
					}}
					theme={$_histogramsTheme}
				/>
			</div>
		</div>
	</Grid2Columns>
{/if}

<style>
	.col {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		padding: 0;
	}
	.histogram {
		height: 100%;
		width: 100%;
	}
</style>
