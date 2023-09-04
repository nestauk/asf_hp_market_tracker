<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {hsl} from 'd3-color';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
    import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
    import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import Treemap from '$lib/components/svizzle/Treemap.svelte';
	import View from '$lib/components/viewports/View.svelte';
    import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_barchartsTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {getDocCount} from '$lib/utils/getters.js';
	import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

	const valueAccessor = getDocCount;
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));

	/* barchart */

	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: isMetricLabelPlural = $_selection.stringsTopCount > 1;
	$: metricLabel =
		`${$_currentMetric.label.toLowerCase()}${isMetricLabelPlural ? 's' : ''}`;
	$: barchartTitle = `Top ${$_selection.stringsTopCount} ${metricLabel}`;

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let barchartItems;
	let doDraw = false;
	let domain;
	let items;
	let keyToColorFn;
	let keyToColorLabelFn;

	$: if (proceed) {
		items = $_viewData?.response.data.terms?.buckets || [];

		/* colors */

		domain = pluckKeySorted(items);
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
</script>

{#if doDraw}
	{#if $_isSmallScreen}
		<View id='stats'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Treemap
					{items}
					{keyToColorFn}
					{keyToColorLabelFn}
					{valueAccessor}
				/>
			</GridRows>
		</View>

		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Scroller>
					<BarchartVDiv
						{keyToColorFn}
						items={barchartItems}
						shouldResetScroll={true}
						theme={$_barchartsTheme}
						title={barchartTitle}
					/>
				</Scroller>
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
		height: 100%;
		width: 100%;
	}
</style>
