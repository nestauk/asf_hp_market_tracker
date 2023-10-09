<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {makeStyleVars} from '@svizzle/dom';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {getKey, makeWithKeys} from '@svizzle/utils';
	import {pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/SelectorRegionType.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import {MAPBOXGL_ACCESSTOKEN as accessToken} from '$lib/config/map.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {
		_featureNameId,
		_mapStyle,
		_zoom,
	} from '$lib/stores/maps.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {
		_barchartsTheme,
		_currThemeVars,
		_legendsTheme,
		_regionKindTheme,
	} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_selectedBbox} from '$lib/stores/view.js';

	export let amountOfBins;
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
	let getFeatureState;
	let heroKey;
	let isSingleValue;
	let itemsIndex;
	let keyToColorFn;
	let legendBins;
	let legendKeys;
	let regionType;

	const onMapFeaturesHovered = ({detail: {features, x, y}}) => {
		let item;
		if (features.length > 0) {
			const {properties: {[$_featureNameId]: featureName}} = features[0];
			item = itemsIndex[featureName];
		}
		if (item) {
			const {key} = item;

			$_tooltip = {
				key,
				value: formatFn(valueAccessor(item)),
				x,
				y,
			};

			// barchart
			heroKey = key;
		} else {
			clearTooltip();

			// barchart
			heroKey = null;
		}
	}

	$: regionKindStyle = makeStyleVars($_regionKindTheme);
	$: amountOfBins = amountOfBins || 5;
	$: if (items?.length > 0) {

		/* common */

		const domain = makeDomain(items);
		isSingleValue = domain[0] === domain[1];
		let binCount = isSingleValue ? 1 : amountOfBins;

		const colorScheme = _.map(
			_.range(0, 1, 1 / (binCount - 1)).concat(1),
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

		if (isSingleValue) {
			legendKeys = [formatFn(domain[0])];
			keyToColorFn = _.always(colorScale(domain[0]));
		}

		/* barchart */

		barchartItems = makeBarchartItems(items) || [];

		/* map */

		regionType = $_selection.regionType;

		itemsIndex = _.index(items, getKey);
		getFeatureState = feature => {
			const {properties: {[$_featureNameId]: featureName}} = feature;
			const item = itemsIndex[featureName];
			const featureState = {
				fill: item ? colorScale(valueAccessor(item)) : null,
				stroke: item ? $_currThemeVars['--colorMapStrokeSelected'] : null
			}

			return featureState;
		}

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='map'>
			<GridRows rowLayout='min-content 4em 1fr min-content'>
				<MetricTitle />

				{#if isSingleValue}
					<div class='keysLegend'>
						<KeysLegend
							{keyToColorFn}
							keys={legendKeys}
						/>
					</div>
				{:else}
					<ColorBinsDiv
						bins={legendBins}
						flags={{
							isVertical: false,
							showTicksExtentOnly: true
						}}
						geometry={{
							left: 50,
							right: 50,
						}}
						padding=0
						theme={$_legendsTheme}
						ticksFormatFn={formatFn}
					/>
				{/if}

				<div
					class='col1'
				>
					<Mapbox
						{_zoom}
						{accessToken}
						{getFeatureState}
						bounds={$_selectedBbox}
						isAnimated={false}
						isInteractive={false}
						on:mapFeaturesTouchStarted={onMapFeaturesHovered}
						reactiveLayers={[regionType]}
						style={$_mapStyle}
						visibleLayers={['nuts21_0', regionType]}
						withScaleControl={false}
						withZoomControl={false}
					/>
					<span style={regionKindStyle}>
						{$_currentMetric.geoPrefix} regions
					</span>
				</div>

				<SelectorRegionType />
			</GridRows>
		</View>
		<View id='barchart'>
			<GridRows rowLayout='min-content 4em 1fr min-content'>
				<MetricTitle />

				{#if isSingleValue}
					<div class='keysLegend'>
						<KeysLegend
							{keyToColorFn}
							keys={legendKeys}
						/>
					</div>
				{:else}
					<ColorBinsDiv
						bins={legendBins}
						flags={{
							isVertical: false,
							showTicksExtentOnly: true
						}}
						geometry={{
							left: 50,
							right: 50,
						}}
						padding=0
						theme={$_legendsTheme}
						ticksFormatFn={formatFn}
					/>
				{/if}

				<Scroller>
					<BarchartVDiv
						{formatFn}
						{title}
						items={barchartItems}
						shouldResetScroll={true}
						theme={$_barchartsTheme}
						valueToColorFn={colorScale}
					/>
				</Scroller>

				<SelectorRegionType />
			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content 1fr'>
		<FlexBar>
			<SelectorRegionType />
		</FlexBar>
		{#if doDraw}
			<GridColumns
				colLayout='14% 56% 30%'
				gap='0.25em'
			>
				<div class='col0'>
					{#if isSingleValue}
						<div class='singleValue legend'>
							<KeysLegend
								{keyToColorFn}
								keys={legendKeys}
							/>
						</div>
					{:else}
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
					{/if}
				</div>

				<div class='col1'>
					<Mapbox
						{_zoom}
						{accessToken}
						{getFeatureState}
						bounds={$_selectedBbox}
						isAnimated={false}
						isInteractive={false}
						on:mapFeaturesHovered={onMapFeaturesHovered}
						reactiveLayers={[regionType]}
						style={$_mapStyle}
						visibleLayers={['nuts21_0', regionType]}
						withScaleControl={false}
						withZoomControl={false}
					/>
					<span style={regionKindStyle}>
						{$_currentMetric.geoPrefix} regions
					</span>
				</div>

				<BarchartVDiv
					{formatFn}
					{heroKey}
					{title}
					items={barchartItems}
					shouldResetScroll={true}
					shouldScrollToHeroKey={true}
					theme={$_barchartsTheme}
					valueToColorFn={colorScale}
				/>
			</GridColumns>
		{/if}
	</GridRows>
{/if}

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
	.singleValue.legend {
		height: min-content;
		margin: auto;
	}

	.col1 {
		position: relative;
		height: 100%;
		width: 100%;
	}
	.col1 > span {
		background-color: var(--backgroundColor);
		border: var(--border);
		bottom: 0;
		margin: 0.5em;
		padding: 0.1em 0.5em;
		position: absolute;
		right: 0;
	}
</style>
