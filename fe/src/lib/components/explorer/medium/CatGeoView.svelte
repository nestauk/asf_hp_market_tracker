<script>
	import {ColorBinsDiv} from '@svizzle/legend';
	import {
		applyFnMap,
		arraySumWith,
		getKey,
		getValue,
		getValues,
		makeWithKeys,
	} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

	import Bullet from '$lib/components/explorer/Bullet.svelte';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import LabelsGrid
		from '$lib/components/explorer/medium/LabelsGrid.svelte';
	import ScrollableGrid
		from '$lib/components/explorer/medium/ScrollableGrid/ScrollableGrid.svelte';
	import SelectorCategsGeoSortBy
		from '$lib/components/explorer/medium/SelectorCategsGeoSortBy.svelte';
				import SelectorCategsGeoSorting
		from '$lib/components/explorer/medium/SelectorCategsGeoSorting.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/medium/SelectorRegionType.svelte';
	import Grid3Columns from '$lib/components/svizzle/Grid3Columns.svelte';
	import GridLayout from '$lib/components/svizzle/GridLayout.svelte';
	import {
		DEFAULT_BBOX_WS_EN,
		MAPBOXGL_ACCESSTOKEN as accessToken,
	} from '$lib/config/map.js';
	import {
		_bbox_WS_EN,
		_featureNameId,
		_smallMultMapStyle,
		_zoom,
	} from '$lib/stores/maps.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_legendsTheme} from '$lib/stores/theme.js';

	export let amountOfBins = 5;
	export let formatFn;
	export let interpolateColor;
	export let items;
	export let keyAccessor;
	export let keyAccessor2;
	export let makeDomain;
	export let title;
	export let valueAccessor;
	export let valueAccessor2;

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

/* 	const getInnerCategs = _.pipe([
		_.flatMapWith(
			_.pipe([getValues, _.mapWith(getKey)])
		),
		_.uniques,
		_.sortWith([])
	]);
	*/
	const getCategs = _.pipe([
		_.mapWith(getKey),
		_.sortWith([])
	]);

	const getEnumeratedMapping = _.pipe([
		_.zipWithIndex,
		_.mapWith(_.collect([
			_.getAt(0),
			_.pipe([
				_.getAt(1),
				_.add(1)
			])
		])),
		_.fromPairs
	]);

	const pivotHierarchicalArray = _.pipe([
		_.flatMapWith(({key, values}) =>
			_.map(values, ({key: subKey, value}) =>
				({
					key,
					subKey,
					value
				})
			)
		),
		_.groupBy(_.getKey('subKey')),
		_.pairs,
		_.mapWith(applyFnMap({
			key: _.getAt(0),
			values: _.pipe([
				_.getAt(1),
				_.mapWith(applyFnMap({
					key: _.getKey('key'),
					value: _.getKey('value')
				}))
			])
		}))
	]);

	const renderCategories = async () => {
		const categoryIndex = _.index(mapItems, getKey);
		const makeGetFeatureState = category => {
			const itemsIndex = _.index(categoryIndex[category].values, getKey);

			return feature => {
				const {properties: {[$_featureNameId]: featureName}} = feature;
				const item = itemsIndex[featureName];

				if (item) {
					const featureState = {
						fill: colorScale(item.value)
					}

					return featureState;
				}
			}
		};

		mapDataURLs = {};
		shouldCaptureCanvas = true;
		for (const cat of categories) {
			getFeatureState = makeGetFeatureState(cat); // causes reactive rerender
			mapDataURLs[cat] = await new Promise(resolve => {
				// is later called during the Mapbox mapDataURL event
				resolveDataURLPromise = resolve;
			});
		}
		shouldCaptureCanvas = false;
	}

	/* map events */

	const onMapDataURL = ({detail: url}) => {
		// if somebody is waiting for the mapDataURL, resolve the promise
		resolveDataURLPromise?.(url);
		// reset the promise. not really needed, but correct
		resolveDataURLPromise = null;
	}
	const onMapDataLoaded = () => {
		// if (!areAllTilesLoaded) {
			areAllTilesLoaded = true;
			console.log('all tiles loaded.');
		// }
	}
	const onMapDataLoading = () => {
		areAllTilesLoaded = false;
		console.log('tiles loading...');
	}

	/* props */

	let bestFit;
	let categories;
	let colorScale;
	let doDraw = false;
	let domain;
	let getFeatureState;
	let gridItems;
	let areAllTilesLoaded;
	let labelsByCategory;
	let legendBins;
	let mapDataURLs = {};
	let mapItems;
	let preferredAspectRatio;
	let regionType;
	let resolveDataURLPromise;
	let shouldCaptureCanvas = false;

	$: {
		const [[W, S], [E, N]] = DEFAULT_BBOX_WS_EN;
		preferredAspectRatio = (E - W) / (N - S);
		console.log('preferredAspectRatio');
	}

	$: sorter =
		$_selection.categsGeoSortBy === 'regionName' ? getKey : getItemSum;
	$: sortItems = _.sortWith([
		$_selection.categsGeoSorting === 'desc'
			? _.sorterDesc(sorter)
			: sorter
	]);
	$: {
		regionType = $_selection.regionType;
		// areAllTilesLoaded = false;
		console.log('regionType', regionType);
	}
	$: if (items?.length > 0) {

		/* common */

		domain = getOverallExtent(items);

		gridItems = sortItems(reshapeItems(items));
		mapItems = pivotHierarchicalArray(gridItems);
		
		categories = getCategs(mapItems);
		labelsByCategory = getEnumeratedMapping(categories);

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

		doDraw = true;
		console.log('mapItems', mapItems);
	}
	$: if (areAllTilesLoaded && mapItems) {
		console.log('rendering categories')
		renderCategories(categories);
	}
</script>

{#if bestFit}
	<div class='mb_container'>
		<div class='mb_instance' style='width: {bestFit.width * 4}px; height: {bestFit?.height * 4}px'>
			<Mapbox
				{_zoom}
				{accessToken}
				{getFeatureState}
				bounds={DEFAULT_BBOX_WS_EN}
				isAnimated={false}
				isInteractive={false}
				on:mapDataURL={onMapDataURL}
				on:dataLoaded={onMapDataLoaded}
				on:dataLoading={onMapDataLoading}
				{shouldCaptureCanvas}
				style={$_smallMultMapStyle}
				visibleLayers={['nuts0', regionType]}
				withScaleControl={false}
				withZoomControl={false}
			/>
		</div>
	</div>
{/if}

<div class='threeRows'>
	<FlexBar>
		<SelectorRegionType />
		<SelectorCategsGeoSortBy />
		<SelectorCategsGeoSorting />
	</FlexBar>

	{#if doDraw}
		<LabelsGrid
			{categories}
			{labelsByCategory}
			minCellWidth = '15%'
		/>
		<div class='gridcontainer'>
			<Grid3Columns
				percents={[15, 60, 25]}
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
				<div class='col1' slot='col1'>
					<GridLayout
						aspectRatio={preferredAspectRatio}
						bind:computedDimensions={bestFit}
						keys={categories}
						let:key={category}
					>
						<div class='map' style='--fitWidth: {bestFit.width}px; --fitHeight: {bestFit.height}px;'>
							<label>
								<Bullet
									backgroundColor={'var(--colorAux)'}
									color={'var(--colorAuxText)'}
									text={labelsByCategory[category]}
								/>
							</label>
							<img src={mapDataURLs[category]}/>
						</div>
					</GridLayout>
				</div>
				<ScrollableGrid
					{categories}
					{colorScale}
					{domain}
					{labelsByCategory}
					items={gridItems}
					slot='col2'
				/>
			</Grid3Columns>
		</div>
 	{/if}
</div>

<style>
	.main {
		display: grid;
		grid-template-rows: min-content 1fr;
		height: 100%;
		overflow: hidden;
	}
	.threeRows {
		display: grid;
		gap: 1.5em;
		grid-template-rows: min-content min-content 1fr;
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
	.col0 {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: 0;
		width: 100%;
	}
	.col1, .col2 {
		height: 100%;
		overflow: hidden;
		width: 100%;
	}

	.legend {
		height: 50%;
		width: 100%;
	}
	.gridcontainer {
		overflow: hidden;
	}
	.mb_container {
		position: fixed;
		top: 0;
		left: 0;
 		width: 0;
		height: 0;
		overflow: hidden;
	}
	.map {
		overflow: hidden;
	}
	.map label {
		position: absolute;
	}
	.map img {
		width: var(--fitWidth);
		height: var(--fitHeight);
		object-fit: contain;
	}
</style>
