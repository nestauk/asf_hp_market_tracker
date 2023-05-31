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

	import DevView from '../DevView.svelte';

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

	const widthRangeInEm = [7, 20];
	const heightRangeInEm = [9, 30];

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
	])

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

	const findBestFit = (gridWidth, gridHeight, rectWidthRange, rectHeightRange, neededRects) => {
		// Create arrays with the possible dimensions
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
					return {width, height, totalRects};
				}
			)
		);
		console.log(combinations);

		// Filter out the combinations that don't fit in the grid
		const validCombinations = _.filter(
			combinations,
			({width, height, totalRects}) =>
				Math.floor(gridWidth / width) > 0
				&& Math.floor(gridHeight / height) > 0
				&& totalRects > neededRects
		);
		console.log(validCombinations);

		// Find the combination that gives the greatest area
		return _.reduce(
			validCombinations,
			(bestFit, {width, height, totalRects}) => {
				const area = totalRects * width * height;

				return (!bestFit || area < bestFit.maxArea) 
					? {width, height, totalRects, maxArea: area}
					: bestFit;
			},
			null
		);
	}


	let categories;
	let colorScale;
	let doDraw = false;
	let domain;
	let gridSize;
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
			gridSize = [$_gridSize.inlineSize, $_gridSize.blockSize];
			gridSizeInGlyphs = [
				Math.floor(gridSize[0] / $_screen.glyph.width),
				Math.floor(gridSize[1] / $_screen.glyph.height)
			]
			const bestFit = findBestFit(...gridSizeInGlyphs, widthRangeInEm, heightRangeInEm, categories.length);
			console.log('bestFit', bestFit);
		}


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
			<div slot='col1' class='col1' use:gridObserver>
				{#each categories as category}
					<div class='choropleth'>
						<div>
							{category}
						</div>
						<div class='map'>
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
						</div>
					</div>
				{/each}
			</div>
			<DevView slot='col2' />
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
		display: grid;
		grid-gap: 10px;
		grid-template-columns: repeat(auto-fit, 8rem);
		grid-template-rows: repeat(5, max-content min-content);
	}
	.choropleth {
		display: grid;
		grid-template-rows: subgrid;
	}
	.map {
		height: 10rem;
	}
</style>
