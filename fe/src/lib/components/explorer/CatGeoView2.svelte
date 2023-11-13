<script>
	// import {BarchartVDiv} from '@svizzle/barchart';
	import {makeStyleVars} from '@svizzle/dom';
	import {ColorBinsDiv} from '@svizzle/legend';
	import {
		applyFnMap,
		arraySumWith,
		getKey,
		getValue,
		getValues,
		isNumber,
		makeArrayToObjectWith,
		makeWithKeys,
		objectToKeyValueArray,
	} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

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
	import XorNavigator from '$lib/components/svizzle/ui/XorNavigator.svelte';
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
		_xorNavigatorTheme,
	} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_selectedBbox} from '$lib/stores/view.js';
	import {getSorters} from '$lib/utils/ordering.js';
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

	// FIXME temporary due to a Lamb's bug
	const arraySumWith2 = (accessor, initialValue = 0) =>
		array => _.reduce(array, (acc, item) => {
			const value = accessor(item);

			return acc + (isNumber(value) ? value : 0);
		}, initialValue);

	/* handlers */

	let heroKey;

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
				const {key, value} = item;

				$_tooltip = {
					key,
					value: formatFn ? formatFn(value) : value,
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

	let categoryBarchartItems;
	let colorScale;
	let currentItems;
	let currentKey;
	let doDraw = false;
	let getFeatureState;
	let isSingleValue;
	let itemsIndex;
	let keyToColorFn;
	let legendBins;
	let legendKeys;
	let regionType;
	let valuesToLabels;

	const onKeyChange = ({detail}) => {currentKey = detail};

	const onClickedCategoryBar = ({detail: {key}}) => {
		currentKey = key
	}

	$: regionType = $_selection.regionType;
	$: regionKindStyle = makeStyleVars($_regionKindTheme);
	$: sortItems = $_selection.categsGeoSortBy === 'regionName'
		? _.sortWith([getKey])
		: _.sortWith([_.sorterDesc(getItemSum)]);

	$: sorters = getSorters($_currentMetric?.id);
	$: if (items?.length > 0) {

		/* common */

		const reshapedItems = sortItems(reshapeItems(items));
		const itemsByInnerKey = indexByInnerKey(reshapedItems);

		/* categories */

		const categories = sorters.keySorter(getInnerCategs(reshapedItems));

		const getCategoryBarchartItems = _.pipe([
			_.mapValuesWith(arraySumWith2(getValue)),
			objectToKeyValueArray,
			sorters.itemsSorter
		]);
		categoryBarchartItems = getCategoryBarchartItems(itemsByInnerKey);

		/* color */

		const domain = getOverallExtent(items);

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
			legendKeys = [formatFn ? formatFn(domain[0]) : domain[0]];
			keyToColorFn = _.always(colorScale(domain[0]));
		}

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
				fill: item
					? colorScale(getValue(item))
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
			<GridRows rowLayout='min-content 4em 1fr min-content min-content'>
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
						style={$_mapStyle}
						theme={$_mapboxTheme}
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

				<BarchartVDiv
					{formatFn}
					geometry={$_barchartGeometry}
					items={currentItems}
					shouldResetScroll={true}
					theme={$_barchartsTheme}
					valueToColorFn={colorScale}
				/>

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
			<GridColumns colLayout='50% 50%'>
				<SelectorRegionType/>

				<div class='legend'>
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
				</div>
			</GridColumns>

			<GridColumns
				colLayout='25% 44% 30%'
				gap='1%'
			>
				<div class='col0'>
					{#if isSingleValue}
						<div class='keysLegend'>
							<KeysLegend
								{keyToColorFn}
								keys={legendKeys}
							/>
						</div>
					{:else}
						<div class='barchart'>
							<BarchartVDiv
								{formatFn}
								geometry={$_barchartGeometry}
								heroKey={currentKey}
								isInteractive={true}
								items={categoryBarchartItems}
								on:clicked={onClickedCategoryBar}
								shouldResetScroll={true}
								shouldScrollToHeroKey={true}
								theme={$_barchartsTheme}
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

				<div class='barchart'>
					<BarchartVDiv
						{formatFn}
						{heroKey}
						geometry={$_barchartGeometry}
						isInteractive={true}
						items={currentItems}
						on:entered={onBarEntered}
						on:exited={clearHero}
						shouldResetScroll={true}
						shouldScrollToHeroKey={true}
						theme={$_barchartsTheme}
						valueToColorFn={colorScale}
					/>
				</div>
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
		height: 100%;
		max-height: 4em;
		width: 100%;
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
	.barchart {
		align-content: center;
		display: grid;
		height: 100%;
		width: 100%;
	}
</style>
