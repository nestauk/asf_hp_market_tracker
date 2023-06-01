<script>
	import {ColorBinsDiv} from '@svizzle/legend';
	import {_screen, setupResizeObserver} from '@svizzle/ui';
	import {applyFnMap, getKey, makeWithKeys} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
	import * as _ from 'lamb';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

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

	const widthRangeInGlyph = [7, 15];
	const heightRangeInGlyph = [8, 20];
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

	const findBestFit = (
		gridWidth,
		gridHeight,
		rectWidthRange,
		rectHeightRange,
		neededRects,
		desiredAspectRatio
	) => {

		// Create arrays of the size of all possible width and height dimensions
		const rectWidths = _.range(rectWidthRange[0], rectWidthRange[1] + 1);
		const rectHeights = _.range(rectHeightRange[0], rectHeightRange[1] + 1);

		// Generate all the possible combinations of dimensions
		const combinations = _.flatMap(
			rectWidths,
			width => _.map(
				rectHeights,
				height => {
					const numFitHorizontally = Math.floor(gridWidth / width);
					const numFitVertically = Math.floor(gridHeight / height);
					const totalRects = numFitHorizontally * numFitVertically;
					const aspectRatio = width / height;
					return {
						aspectRatio,
						height,
						numFitHorizontally,
						numFitVertically,
						surfaceArea: width * height,
						totalRects,
						width,
					};
				}
			)
		);
		console.log('combinations', combinations);

		// Filter out the combinations that don't fit in the grid
		const validCombinations = _.filter(
			combinations,
			({totalRects}) => totalRects >= neededRects
		);
		console.log('validCombinations', validCombinations);

		// Find the combination that gives the min number of rects
		// closest aspect ratio to `desiredAspectRatio` and max surface area
		return _.reduce(
			validCombinations,
			(
				bestFit,
				{
					aspectRatio,
					height,
					numFitHorizontally,
					numFitVertically,
					surfaceArea,
					totalRects,
					width,
				}
			) => {
				const aspectRatioDiff = Math.abs(desiredAspectRatio / aspectRatio);
				const cellRatio = numFitHorizontally / numFitVertically;
				const cellRatioDiff = Math.abs(desiredAspectRatio - cellRatio);
				const isBetterFit = 
					!bestFit ||
					numFitHorizontally < bestFit.numFitHorizontally
					// totalRects === bestFit.totalRects ||
					// aspectRatioDiff < bestFit.aspectRatioDiff // ||
					// (numFitHorizontally < bestFit.numFitHorizontally && height > bestFit.height)
					// (surfaceArea > bestFit.surfaceArea && numFitHorizontally < bestFit.numFitHorizontally) // ||
					// numFitHorizontally < bestFit.numFitHorizontally;
					// (totalRects === bestFit.totalRects && aspectRatioDiff < bestFit.aspectRatioDiff) ||
					// (totalRects === bestFit.totalRects && aspectRatioDiff === bestFit.aspectRatioDiff && surfaceArea > bestFit.surfaceArea) ||
					// (totalRects === bestFit.totalRects && aspectRatioDiff === bestFit.aspectRatioDiff && surfaceArea === bestFit.surfaceArea && (numFitVertically > bestFit.numFitVertically));
				
				return isBetterFit ?
					{
						aspectRatioDiff,
						cellRatio,
						height,
						numFitHorizontally,
						numFitVertically,
						surfaceArea,
						totalRects,
						width,
						cellRatio
					} :
					bestFit;
			},
			null
		);
	}

	function chunkArray(array, size, filler = null) {
		const chunkIndices = _.range(0, array.length, size);
		const chunks = _.map(chunkIndices, i => _.slice(array, i, i + size));

		// Add filler cells to the last chunk to complete the grid
		const lastChunk = chunks[chunks.length - 1];
		while (lastChunk.length < size) {
			lastChunk.push(filler);
		}

		return chunks;
	}

	let bestFit;
	let catChunks = [];
	let categories;
	let colorScale;
	let doDraw = false;
	let domain;
	let gridItems;
	let gridSizeInGlyphs;
	let legendBins;
	let makeGetFeatureState
	let regionType;
	let reshapedItems;

	$: if (items && items.length > 0) {

		/* common */

		reshapedItems = reshapeItems(items);
		categories = getCategs(reshapedItems);
		domain = getOverallExtent(items);

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

		const categoryIndex = _.index(reshapedItems, getKey);
		makeGetFeatureState = category => {
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

		/* grid layout */

		if ($_screen) {
			const {inlineSize: width, blockSize: height} = $_gridSize;
			const {width: gWidth, height: gHeight} = $_screen.glyph;
			gridSizeInGlyphs = [
				Math.floor(width / gWidth),
				Math.floor(height / gHeight)
			];
			console.log('glyph size in px', gWidth, gHeight);
			console.log('gridSizeInGlyphs', gridSizeInGlyphs);
			console.log('neededRects', categories.length);
			bestFit = findBestFit(
				...gridSizeInGlyphs,
				widthRangeInGlyph,
				heightRangeInGlyph,
				categories.length,
				preferredAspectRatio
			);

			console.log('bestFit', bestFit);



			if (bestFit) {
				// expand width & height
				bestFit.width *= gridSizeInGlyphs[0] / (bestFit.width * bestFit.numFitHorizontally);
				bestFit.height *= gridSizeInGlyphs[1] / (bestFit.height * bestFit.numFitVertically);
				
				catChunks = chunkArray(
					categories,
					bestFit.numFitHorizontally
				);
				console.log('catChunks', catChunks);
			}
		}

		/* category grid */

		gridItems = pivotHierarchicalArray(reshapedItems);

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<RegionLevelSelector />
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
							<div>
								{#if category}
									{category}
								{/if}
							</div>
						{/each}
						{#each chunk as category}
							<div class='map'>
								{#if category}
									<Mapbox
										{_zoom}
										{accessToken}
										getFeatureState={makeGetFeatureState(category)}
										bounds={DEFAULT_BBOX_WS_EN}
										isAnimated={false}
										isInteractive={false}
										style={$_smallMultMapStyle}
										visibleLayers={[regionType]}
										withScaleControl={false}
										withZoomControl={false}
									/>
								{/if}
							</div>
						{/each}
					{/each}
				{/if}
			</div>
			<CategoryGrid
				{domain}
				items={gridItems}
				slot='col2'
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
	.col1 {
		width: 100%;
		height: 100%;
		display: grid;
		grid-gap: 0;
		grid-template-columns: repeat(var(--repeat), var(--map-width));
		justify-content: center;
		align-content: center;
	}
	.map {
		height: var(--map-height);
	}
</style>
