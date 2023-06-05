<script>
	import {ColorBinsDiv} from '@svizzle/legend';
	import {_screen, setupResizeObserver} from '@svizzle/ui';
	import {applyFnMap, getKey, makeWithKeys} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {CustomControl, Mapbox} from '@svizzle/mapbox'; // workspace

	import RegionLevelSelector
		from '$lib/components/explorer/medium/RegionTypeSelector.svelte';
	import Grid3Columns from '$lib/components/svizzle/Grid3Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import {
		DEFAULT_BBOX_WS_EN,
		MAPBOXGL_ACCESSTOKEN as accessToken,
	} from '$lib/config/map.js';
	import {
		_bbox_WS_EN,
		_bbox_WSEN,
		_featureNameId,
		_smallMultMapStyle,
		_zoom,
	} from '$lib/stores/maps.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_barchartsTheme, _legendsTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';

	import CategoryGrid from './CategoryGrid.svelte';
	import Pill from '../Pill.svelte';

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

	const preferredAspectRatio = 0.75;

	const {_writable: _gridSize, resizeObserver: gridObserver} =
		setupResizeObserver();

	const getOverallExtent = _.pipe([
		_.flatMapWith(
			_.pipe([
				valueAccessor,
				_.mapWith(valueAccessor2)
			])
		),
		extent
	]);

	// copied from `fe/src/routes/explorer/category/time/[slug]/+page.svelte`
	// should centralize/refactor
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

	const getCategs = _.pipe([
		_.mapWith(getKey),
		_.sortWith([])
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

	const getMaxRectangles = (containerWidth, containerHeight, rectWidth, rectHeight) => {
		const numFitHorizontally = Math.floor(containerWidth / rectWidth);
		const numFitVertically = Math.floor(containerHeight / rectHeight);
		return {numFitHorizontally, numFitVertically};
	}

	const getBestRectangleFit = (containerWidth, containerHeight, aspectRatio, maxRects) => {
		let width = containerWidth;
		let height = width / aspectRatio;

		let rectanglesFit;
		do {
			rectanglesFit = getMaxRectangles(containerWidth, containerHeight, width, height);
			if (rectanglesFit.numFitHorizontally * rectanglesFit.numFitVertically < maxRects) {
				width -= 16;
				height = width / aspectRatio;
			}
		} while (rectanglesFit.numFitHorizontally * rectanglesFit.numFitVertically < maxRects)

		return {
			...rectanglesFit,
			height,
			width
		};
	}

	const chunkArray = (array, size, filler = null) => {
		const chunkIndices = _.range(0, array.length, size);
		const chunks = _.map(chunkIndices, i => _.slice(array, i, i + size));

		// Add filler cells to the last chunk to complete the grid
		// FIXME add filler cells around existing cells, not only at the end
		const lastChunk = chunks[chunks.length - 1];
		while (lastChunk.length < size) {
			lastChunk.push(filler);
		}

		return chunks;
	}

	const makeMakeGetFeatureState = () => {
		const categoryIndex = _.index(reshapedItems, getKey);
		return category => {
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
		}
	}

	const renderCategories = async () => {
		mapDataURLs = {};
		for (const cat of categories) {
			console.log('rendering category', cat);
			category = cat;  // rerenders reactively
			console.log('waiting for render...', cat);
			await new Promise(resolve => {
				console.log('promise created', cat)
				resolveDataURLPromise = resolve;
			});
		}
	}
	const addDataURL = url => {
		console.log('adding url', url);
		if (url) {
			mapDataURLs[category] = url;
			console.log('resolving...', category);
			resolveDataURLPromise();
			console.log('resolved', category);
		}
	}
	const onMapLoaded = () => {
		console.log('map loaded, event received');
		if (!isMapLoaded) {
			isMapLoaded = true;
		}
	}

	$: addDataURL($_mapDataURL);

	let _mapDataURL;
	let bestFit;
	let catChunks = [];
	let categories;
	let category;
	let categoryLabels;
	let colorScale;
	let doDraw = false;
	let domain;
	let isMapLoaded = false;
	let gridItems;
	let gridSizeInGlyphs;
	let legendBins;
	let makeGetFeatureState;
	let mapDataURLs = {};
	let regionType;
	let reshapedItems;
	let resolveDataURLPromise;

	$: if (items?.length > 0) {

		/* common */

		reshapedItems = reshapeItems(items);
		const cats = getCategs(reshapedItems);
		if (JSON.stringify(cats) !== JSON.stringify(categories)) {
			console.log('updating categories')
			categories = cats;
		}
		domain = getOverallExtent(items);
		categoryLabels = _.pipe([
			_.zipWithIndex,
			_.mapWith(_.collect([
				_.getAt(0),
				_.pipe([
					_.getAt(1),
					_.add(1)
				])
			])),
			_.fromPairs
		])(categories);

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
	
		/* maps */

		regionType = $_selection.regionType;

		/* grid layout */

		if ($_screen) {
			const {inlineSize: width, blockSize: height} = $_gridSize;
			const {width: gWidth, height: gHeight} = $_screen.glyph;
			gridSizeInGlyphs = [
				Math.floor(width / gWidth),
				Math.floor(height / gHeight)
			];
			// console.log('glyph size in px', gWidth, gHeight);
			// console.log('gridSizeInGlyphs', gridSizeInGlyphs);
			// console.log('neededRects', categories.length);

			bestFit = getBestRectangleFit(width, height, preferredAspectRatio, categories.length);

			// console.log('bestFit', bestFit);

			if (bestFit) {
				// expand width & height
				bestFit.width *= gridSizeInGlyphs[0] / (bestFit.width * bestFit.numFitHorizontally);
				bestFit.height *= gridSizeInGlyphs[1] / (bestFit.height * bestFit.numFitVertically);
				
				catChunks = chunkArray(
					categories,
					bestFit.numFitHorizontally
				);
				// console.log('catChunks', catChunks);
			}
		}

		/* category grid */

		gridItems = pivotHierarchicalArray(reshapedItems);

		doDraw = true;
	}

	$: if (categories && isMapLoaded) {
		console.log('ready to render categories', categories);
		makeGetFeatureState = makeMakeGetFeatureState();
		renderCategories();
	}
	$: console.log('mapDataURLs', mapDataURLs);
	// $: console.log('$_mapDataURL',$_mapDataURL);
</script>

<div class='mb_instance'>
	<Mapbox
		{_zoom}
		{accessToken}
		bind:_mapDataURL
		getFeatureState={makeGetFeatureState?.(category)}
		bounds={DEFAULT_BBOX_WS_EN}
		isAnimated={false}
		isInteractive={false}
		on:mapLoaded={onMapLoaded}
		shouldCaptureCanvas={true}
		style={$_smallMultMapStyle}
		visibleLayers={[regionType]}
		withScaleControl={false}
		withZoomControl={false}
	>
<!--
		<CustomControl position='top-left'>
			<div class='catLabel'>
				{categoryLabels[category]}
			</div>
		</CustomControl>
-->
	</Mapbox>
</div>

<Grid2Rows percents={[10, 90]}>
	<RegionLevelSelector />
	{#if doDraw}
		<div class='main'>
			<div class='categories'>
				{#each categories as category}
					<div>
						<Pill>
							{categoryLabels[category]}
						</Pill>
						{category}
					</div>
				{/each}
			</div>
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
								right: 20,
							}}
							padding=0
							theme={$_legendsTheme}
							ticksFormatFn={formatFn}
						/>
					</div>
				</div>
				<div
					slot='col1'
					class='col1'
					use:gridObserver
					style='--map-width: {bestFit?.width / 2 || 10}em; --map-height: {bestFit?.height * 1.1 || 8}em; --repeat: {bestFit?.numFitHorizontally || 1};'
				>
					{#if bestFit}
						{#each catChunks as chunk}
							{#each chunk as category}
								<div class='map'>
									<label>
										<Pill>
											{categoryLabels[category]}
										</Pill>
									</label>
									<img src={mapDataURLs[category]}/>
								</div>
							{/each}
						{/each}
					{/if}
				</div>
				<CategoryGrid
					{domain}
					{colorScale}
					columnKeys={categories}
					columnLabels={categoryLabels}
					items={gridItems}
					slot='col2'
				/>
			</Grid3Columns>
		</div>
	{/if}
</Grid2Rows>

<style>
	.main {
		display: grid;
		grid-auto-flow: row;
		grid-template-rows: min-content 1fr;
	}
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
	.col1 {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: grid;
		grid-gap: 0;
		grid-template-columns: repeat(var(--repeat), 1fr);
		justify-content: center;
		justify-items: stretch;
	}
	.map {
		height: 100%;
		position: relative;
	}
	.catLabel {
		padding: 0 0.5em;
	}
	.categories  {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10em, 1fr));
	}
	.mb_instance {
		position: fixed;
		top: 0;
		left: 0;
		width: 400px;
		height: 400px;
	}
	.map label {
		position: absolute;
		top: 0;
		left: 0;
	}
	.map img {
		width: 100%;
		height: 100%;
	}
</style>
