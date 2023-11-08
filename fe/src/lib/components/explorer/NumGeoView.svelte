<script>
	// import {BarchartVDiv} from '@svizzle/barchart';
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
	import BarchartVDiv
		from '$lib/components/svizzle/barchart/BarchartVDiv.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import KeysLegend from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import {setupGeometryObserver}
		from '$lib/components/svizzle/ui/geometryObserver.js';
	import View from '$lib/components/viewports/View.svelte';
	import {
		heroRegionStrokeWidth,
		MAPBOXGL_ACCESSTOKEN as accessToken,
	} from '$lib/config/map.js';
	import {regionsByType} from '$lib/data/regions.js';
	import {_barchartGeometry} from '$lib/stores/geometry.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {
		_featureNameId,
		_mapStyle,
		_zoom,
	} from '$lib/stores/maps.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_selectedRegionNamesIndex} from '$lib/stores/regions.js';
	import {
		_barchartsTheme,
		_currThemeVars,
		_legendsTheme,
		_mapboxTheme,
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
	export let title = null;
	export let valueAccessor;

	let _projectFn;
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

	const {
		_geometry: _mapGeometry,
		geometryObserver
	} = setupGeometryObserver();

	/* handlers */

	const clearHero = () => {
		clearTooltip();

		// barchart
		heroKey = null;
	}

	const onMapFeaturesEntered = ({detail: {features, x, y}}) => {
		let item;
		if (features.length > 0) {
			const {properties: {[$_featureNameId]: featureName}} = features[0];
			item = itemsIndex[featureName];

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
			} else if (featureName) { // no tooltips on NUTS
				clearHero(); // hovering selected -> non-selected
				$_tooltip = {
					key: featureName,
					x,
					y,
				};
			} else {
				clearHero(); // hovering NI -> Ireland
			}
		} else {
			clearHero();
		}
	}

	const onBarEntered = ({detail: {key, displayValue}}) => {
		heroKey = key;

		const centroid = regionsByType[regionType]?.regions[key]?.centroid;
		if (centroid) {
			const {x, y} = $_projectFn(centroid);

			$_tooltip = {
				key,
				value: displayValue,
				x: $_mapGeometry.left + x,
				y: $_mapGeometry.top + y,
			};
		}
	}

	$: regionType = $_selection.regionType;
	$: regionKindStyle = makeStyleVars($_regionKindTheme);
	$: amountOfBins = amountOfBins || 5;
	$: if (items?.length > 0) {

		/* common */

		const domain = makeDomain(items);
		isSingleValue = domain[0] === domain[1];

		const range = isSingleValue
			? [0]
			: _.range(0, 1, 1 / (amountOfBins - 1)).concat(1);
		const colorScheme = _.map(range, interpolateColor);
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

		itemsIndex = _.index(items, getKey);
		getFeatureState = feature => {
			const {properties: {[$_featureNameId]: featureName}} = feature;
			const item = itemsIndex[featureName];
			const isHero = heroKey === featureName;
			const featureState = {
				fill: item
					? colorScale(valueAccessor(item))
					: $_selectedRegionNamesIndex[featureName]
						? $_currThemeVars['--colorMapFillNodata']
						: null,
				lineWidth: isHero ? heroRegionStrokeWidth : null,
				stroke: item ? $_currThemeVars['--colorMapStrokeSelected'] : null,
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

				<div class='col1'>
					<div class='map'>
						<Mapbox
							{_zoom}
							{accessToken}
							{getFeatureState}
							bounds={$_selectedBbox}
							isAnimated={false}
							isInteractive={false}
							on:mapFeaturesHovered={onMapFeaturesEntered}
							on:mapFeaturesTouchStarted={onMapFeaturesEntered}
							reactiveLayersIds={[regionType]}
							theme={$_mapboxTheme}
							style={$_mapStyle}
							visibleLayersIds={['nuts21_0', regionType]}
							withScaleControl={false}
							withZoomControl={false}
						/>
					</div>
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

				<BarchartVDiv
					{formatFn}
					{title}
					geometry={$_barchartGeometry}
					items={barchartItems}
					shouldResetScroll={true}
					theme={$_barchartsTheme}
					valueToColorFn={colorScale}
				/>

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
				colLayout='10% 59% 30%'
				gap='1%'
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
					<div
						class='map'
						use:geometryObserver
					>
						<Mapbox
							{_zoom}
							{accessToken}
							{getFeatureState}
							bind:_projectFn
							bounds={$_selectedBbox}
							isAnimated={false}
							isInteractive={false}
							on:exited={clearHero}
							on:mapFeaturesHovered={onMapFeaturesEntered}
							on:mapFeaturesTouchStarted={onMapFeaturesEntered}
							reactiveLayersIds={[regionType, `${regionType}_line`]}
							style={$_mapStyle}
							theme={$_mapboxTheme}
							visibleLayersIds={['nuts21_0', regionType, `${regionType}_line`]}
							withScaleControl={false}
							withZoomControl={false}
						/>
						<span style={regionKindStyle}>
							{$_currentMetric.geoPrefix} regions
						</span>
					</div>
				</div>

				<BarchartVDiv
					{formatFn}
					{heroKey}
					{title}
					geometry={$_barchartGeometry}
					isInteractive={true}
					items={barchartItems}
					on:entered={onBarEntered}
					on:exited={clearHero}
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
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
	.map {
		background-color: var(--colorMapSea);
		height: 100%;
		position: relative;
		width: 100%;
	}
	.map > span {
		background-color: var(--backgroundColor);
		border: var(--border);
		bottom: 0;
		margin: 0.5em;
		padding: 0.1em 0.5em;
		position: absolute;
		right: 0;
	}
</style>
