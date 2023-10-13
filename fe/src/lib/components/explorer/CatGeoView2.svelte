<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {makeStyleVars} from '@svizzle/dom';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {
		applyFnMap,
		arraySumWith,
		getKey,
		getValue,
		getValues,
		makeArrayToObjectWith,
		makeWithKeys,
	} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/SelectorRegionType.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {setupGeometryObserver}
		from '$lib/components/svizzle/ui/geometryObserver.js';
	import View from '$lib/components/viewports/View.svelte';
	import XorNavigator from '$lib/components/svizzle/ui/XorNavigator.svelte';
	import {
		heroRegionStrokeWidth,
		MAPBOXGL_ACCESSTOKEN as accessToken,
	} from '$lib/config/map.js';
	import regionsByType from '$lib/data/regions.js';
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
		_xorNavigatorTheme,
	} from '$lib/stores/theme.js';
	import {getSorters} from '$lib/utils/ordering.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_selectedBbox} from '$lib/stores/view.js';
	import {pluckKey} from '$lib/utils/svizzle/utils.js';

	export let amountOfBins = 5;
	export let formatFn;
	export let interpolateColor;
	export let items;
	export let keyAccessor;
	export let keyAccessor2;
	export let valueAccessor;
	export let valueAccessor2;

	let _projectFn;

	const {
		_geometry: _mapGeometry,
		geometryObserver
	} = setupGeometryObserver();

	const getOverallExtent = _.pipe([
		_.flatMapWith(
			_.pipe([
				valueAccessor,
				_.mapWith(valueAccessor2)
			])
		),
		extent
	]);

	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			values: _.pipe([
				valueAccessor,
				_.mapWith(applyFnMap({
					key: keyAccessor2,
					value: valueAccessor2
				}))
			])
		})
	);

	const getItemSum = _.pipe([getValues, arraySumWith(getValue)]);

	/* categories */

	const getInnerCategs = _.pipe([
		_.flatMapWith(
			_.pipe([getValues, pluckKey])
		),
		_.uniques,
	]);

	const getValuesToLabels = makeArrayToObjectWith(
		_.collect([_.identity, _.identity])
	);
	const indexByInnerKey = _.pipe([
		_.flatMapWith(
			({key: outerKey, values}) => _.map(values,
				({key, value}) => ({key, outerKey, value})
			)
		),
		_.groupBy(getKey),
		_.mapValuesWith(
			_.pipe([
				_.mapWith(({outerKey, value}) => ({key: outerKey, value})),
				_.sortWith([_.sorterDesc(getValue)])
			])
		)
	]);

	let heroKey;

	const onMapFeaturesHovered = ({detail: {features, x, y}}) => {
		let featureName;
		if (features.length > 0) {
			({properties: {[$_featureNameId]: featureName}} = features[0]);
		}
		if (featureName) {
			let key;
			let value;
			if (featureName in itemsIndex) {
				({key, value} = itemsIndex[featureName]);
			} else {
				key = featureName;
				value = null;
			}
			$_tooltip = {
				key,
				value: formatFn ? formatFn(value) : value,
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

	const onBarEntered = ({detail: {id}}) => {
		heroKey = id;

		const centroid = regionsByType[regionType]?.regions[id]?.centroid;
		const {x, y} = $_projectFn(centroid);

		$_tooltip = {
			key: id,
			x: $_mapGeometry.left + x,
			y: $_mapGeometry.top + y,
		};
	}
	const onBarExited = () => {
		clearTooltip();

		// barchart
		heroKey = null;
	}

	let colorScale;
	let currentItems;
	let currentKey;
	let doDraw = false;
	let getFeatureState;
	let itemsIndex;
	let legendBins;
	let regionType;
	let valuesToLabels;

	const onKeyChange = ({detail}) => {currentKey = detail};

	$: regionType = $_selection.regionType;
	$: regionKindStyle = makeStyleVars($_regionKindTheme);
	$: sortItems = $_selection.categsGeoSortBy === 'regionName'
		? _.sortWith([getKey])
		: _.sortWith([_.sorterDesc(getItemSum)]);

	$: sorter = getSorters($_currentMetric?.id).keySorter;
	$: if (items?.length > 0) {

		/* common */

		const reshapedItems = sortItems(reshapeItems(items));
		const itemsByInnerKey = indexByInnerKey(reshapedItems);
		const categories = sorter(getInnerCategs(reshapedItems));
		const domain = getOverallExtent(items);

		/* color */

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

		/* navigator */

		valuesToLabels = getValuesToLabels(categories);

		if (!categories.includes(currentKey)) {
			currentKey = categories[0];
		}

		currentItems = itemsByInnerKey[currentKey] || [];

		/* map */

		itemsIndex = _.index(currentItems, getKey);
		getFeatureState = feature => {
			const {properties: {[$_featureNameId]: featureName}} = feature;
			const item = itemsIndex[featureName];
			const isHero = heroKey === featureName;
			const featureState = {
				fill: item ? colorScale(getValue(item)) : null,
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
			<GridRows rowLayout='min-content 4em 1fr min-content min-content'>
				<MetricTitle />

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

				<div class='map'>
					<Mapbox
						{_zoom}
						{accessToken}
						{getFeatureState}
						bounds={$_selectedBbox}
						isAnimated={false}
						isInteractive={false}
						on:mapFeaturesTouchStarted={onMapFeaturesHovered}
						reactiveLayersIds={[regionType]}
						style={$_mapStyle}
						visibleLayersIds={['nuts21_0', regionType]}
						withScaleControl={false}
						withZoomControl={false}
					/>
					<span style={regionKindStyle}>
						{$_currentMetric.geoPrefix} regions
					</span>
				</div>

				<XorNavigator
					{valuesToLabels}
					currentValue={currentKey}
					label='Category'
					on:changed={onKeyChange}
					theme={$_xorNavigatorTheme}
				/>

				<SelectorRegionType />
			</GridRows>
		</View>

		<View id='barchart'>
			<GridRows rowLayout='min-content 1fr min-content min-content'>
				<MetricTitle />

				<Scroller overflowX='hidden'>
					<BarchartVDiv
						{formatFn}
						items={currentItems}
						shouldResetScroll={true}
						theme={$_barchartsTheme}
						valueToColorFn={colorScale}
					/>
				</Scroller>

				<XorNavigator
					{valuesToLabels}
					currentValue={currentKey}
					label='Category'
					on:changed={onKeyChange}
					theme={$_xorNavigatorTheme}
				/>

				<SelectorRegionType />
			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content 1fr'>
		{#if doDraw}
			<GridColumns colLayout='min-content 1fr'>
				<SelectorRegionType/>
				<XorNavigator
					{valuesToLabels}
					currentValue={currentKey}
					label='Category'
					on:changed={onKeyChange}
					theme={$_xorNavigatorTheme}
				/>
			</GridColumns>
			<GridColumns
				colLayout='10% 60% 30%'
				gap='0.25em'
			>
				<div class='col0'>
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
							on:mapFeaturesHovered={onMapFeaturesHovered}
							reactiveLayersIds={[regionType, `${regionType}_line`]}
							style={$_mapStyle}
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
					isInteractive={true}
					items={currentItems}
					on:entered={onBarEntered}
					on:exited={onBarExited}
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
		padding: 0;
		width: 100%;
	}
	.legend {
		height: 50%;
		width: 100%;
	}

	.col1 {
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
	.map {
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
