<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {hsl} from 'd3-color';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Treemap from '$lib/components/svizzle/Treemap.svelte';
	import {_barchartsTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';

	let barchartItems;
	let doDraw = false;
	let domain;
	let items;
	let keyToColorFn;
	let keyToColorLabelFn;

	const valueAccessor = _.getKey('doc_count');
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));
	const makeDomain = _.pipe([_.mapWith(getKey), _.sortWith([])]);

	/* barchart */

	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: if ($_viewData?.code === 200) {
		items = $_viewData?.data.agg1.buckets;

		/* colors */

		domain = makeDomain(items);
		const colorScheme = _.map(
			domain,
			(v, index) => interpolateColor(index / (domain.length - 1))
		);
		keyToColorFn = scaleOrdinal().domain(domain).range(colorScheme);

		const colorSchemeLabel = _.map(
			colorScheme,
			color => hsl(color).l > 0.5 ? 'black' : 'white'
		);
		keyToColorLabelFn = scaleOrdinal().domain(domain).range(colorSchemeLabel);

		/* barchart */

		barchartItems = makeBarchartItems(items) || [];

		doDraw = true;
	}
	$: isMetricLabelPlural = $_selection.stringsTopCount > 1;
	$: metricLabel =
		`${$_currentMetric.label.toLowerCase()}${isMetricLabelPlural ? 's' : ''}`;
	$: barchartTitle = `Top ${$_selection.stringsTopCount} ${metricLabel}`;
</script>

{#if doDraw}
	<Grid2Columns
		percents={[70, 30]}
		gap='0.5em'
	>
		<div slot='col0' class='col'>
			<div class='treemap'>
				<Treemap
					{items}
					{keyToColorFn}
					{keyToColorLabelFn}
					{valueAccessor}
				/>
			</div>
		</div>
		<div slot='col1' class='col'>
			<div class='barchart'>
				<BarchartVDiv
					{keyToColorFn}
					items={barchartItems}
					shouldResetScroll={true}
					theme={$_barchartsTheme}
					title={barchartTitle}
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
	.barchart {
		height: 100%;
		width: 100%;
	}
	.treemap {
		height: 95%;
		width: 100%;
	}
</style>
