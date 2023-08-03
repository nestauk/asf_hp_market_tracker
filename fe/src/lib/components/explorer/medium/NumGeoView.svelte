<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {getKey, makeWithKeys} from '@svizzle/utils';
	import {pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/medium/SelectorRegionType.svelte';
	import Grid3Columns from '$lib/components/svizzle/Grid3Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import {MAPBOXGL_ACCESSTOKEN as accessToken} from '$lib/config/map.js';
	import {
		_featureNameId,
		_mapStyle,
		_zoom,
	} from '$lib/stores/maps.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_barchartsTheme, _legendsTheme} from '$lib/stores/theme.js';
	import {_selectedBbox} from '$lib/stores/view.js';

	export let amountOfBins = 5;
	export let formatFn;
	export let interpolateColor;
	export let items;
	export let makeBarchartItems;
	export let makeDomain;
	export let title;
	export let valueAccessor;

	let barchartItems;
	let colorScale;
	let doDraw = false;
	let domain;
	let getFeatureState;
	let legendBins;
	let regionType;

	$: if (items?.length > 0) {

		/* common */

		domain = makeDomain(items);
		const colorScheme = _.map(
			_.range(0, 1, 1 / (amountOfBins - 1)).concat(1),
			interpolateColor
		);
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

		/* map */

		regionType = $_selection.regionType;

		const itemsIndex = _.index(items, getKey);
		getFeatureState = feature => {
			const {properties: {[$_featureNameId]: featureName}} = feature;
			const item = itemsIndex[featureName];
			const featureState = {
				fill: item ? colorScale(valueAccessor(item)) : null
			}

			return featureState;
		}

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<FlexBar>
		<SelectorRegionType />
	</FlexBar>
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
							right: 50,
						}}
						padding=0
						theme={$_legendsTheme}
						ticksFormatFn={formatFn}
					/>
				</div>
			</div>
			<Mapbox
				{_zoom}
				{accessToken}
				{getFeatureState}
				bounds={$_selectedBbox}
				isAnimated={false}
				isInteractive={false}
				reactiveLayers={[regionType]}
				slot='col1'
				style={$_mapStyle}
				visibleLayers={['nuts21_0', regionType]}
				withScaleControl={false}
				withZoomControl={false}
			/>
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
