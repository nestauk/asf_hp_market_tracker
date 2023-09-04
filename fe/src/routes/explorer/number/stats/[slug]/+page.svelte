<script>
	import {HistogramDiv} from '@svizzle/histogram';
	import {getKey} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {hsl} from 'd3-color';
	import {scaleLinear, scaleOrdinal} from 'd3-scale';
	import {interpolateGnBu as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
    import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
    import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Treemap from '$lib/components/svizzle/Treemap.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {_histogramsTheme} from '$lib/stores/theme.js';
	import {getDocCount} from '$lib/utils/getters.js';
    import { _isSmallScreen } from '$lib/stores/layout.js';

	const valueAccessor = getDocCount;

	/* histogram */

	const getBins = ({items, interval, valueAccessor}) => {
		let itemsPairs = pairs(items);
		const lastItem = _.last(items);
		let bins = _.map(
			itemsPairs,
			([item1, item2]) => ({
				range: [item1.key, item2.key],
				value: valueAccessor(item1)
			})
		).concat({
			range: [lastItem.key, lastItem.key + interval],
			value: valueAccessor(lastItem)
		});

		return bins;
	}

	const makeHistogramDomain = _.pipe([arr => extent(arr, getKey)]);
	const treemapKeyAccessor = _.pipe([
		_.getKey('range'),
		([a, b]) => `${a}-${b}`
	]);
	const makeTreemapDomain = _.mapWith(treemapKeyAccessor);

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let bins;
	let binsFill;
	let doDraw = false;
	let items;
	let keyToColorFn;
	let keyToColorLabelFn;

	$: if (proceed) {
		items = $_viewData?.response.data.histogram?.buckets || [];

		const {interval} = $_viewData?.response.meta;

		/* colors */

		const histogramDomain = makeHistogramDomain(items);
		const tScale = scaleLinear().domain(histogramDomain).range([0, 1]);
		const colorScale = num => interpolateColor(tScale(num));

		/* histogram */

		bins = getBins({items, interval, valueAccessor});
		binsFill = _.map(bins, ({range}) => colorScale(range[0]));

		/* treemap */

		const treemapDomain = makeTreemapDomain(bins);
		const colorScheme = _.map(
			treemapDomain,
			(v, index) => interpolateColor(index / (treemapDomain.length - 1))
		);
		keyToColorFn = scaleOrdinal().domain(treemapDomain).range(colorScheme);

		const colorSchemeLabel = _.map(
			colorScheme,
			color => hsl(color).l > 0.5 ? 'black' : 'white'
		);
		keyToColorLabelFn =
			scaleOrdinal()
			.domain(treemapDomain)
			.range(colorSchemeLabel);

		doDraw = true;
	}
</script>

{#if doDraw}
	{#if $_isSmallScreen}
		<View id='stats'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Treemap
					{keyToColorFn}
					{keyToColorLabelFn}
					items={bins}
					keyAccessor={treemapKeyAccessor}
				/>
			</GridRows>
		</View>

		<View id='barchart'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<HistogramDiv
					{bins}
					{binsFill}
					geometry={{
						safetyXTicks: 100, // TODO calc based on order of magn of ticks
						safetyXValues: 50, // TODO calc based on order of magn of values
					}}
					theme={$_histogramsTheme}
				/>
			</GridRows>
		</View>
	{:else}
		<Grid2Columns
			percents={[70, 30]}
			gap='0.5em'
		>
			<div slot='col0' class='col'>
				<div class='treemap'>
					<Treemap
						{keyToColorFn}
						{keyToColorLabelFn}
						items={bins}
						keyAccessor={treemapKeyAccessor}
					/>
				</div>
			</div>
			<div slot='col1' class='col'>
				<div class='histogram'>
					<HistogramDiv
						{bins}
						{binsFill}
						geometry={{
							safetyXTicks: 100, // TODO calc based on order of magn of ticks
							safetyXValues: 50, // TODO calc based on order of magn of values
						}}
						theme={$_histogramsTheme}
					/>
				</div>
			</div>
		</Grid2Columns>
	{/if}
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
	.treemap {
		height: 100%;
		width: 100%;
	}
</style>
