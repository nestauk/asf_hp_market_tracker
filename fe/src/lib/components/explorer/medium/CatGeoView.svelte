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

	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import LabelsGrid
		from '$lib/components/explorer/medium/LabelsGrid.svelte';
	import ScrollableGrid
		from '$lib/components/explorer/medium/ScrollableGrid/ScrollableGrid.svelte';
	import SelectionXor
		from '$lib/components/explorer/medium/SelectionXor.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/medium/SelectorRegionType.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
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

	const getInnerCategs = _.pipe([
		_.flatMapWith(
			_.pipe([getValues, _.mapWith(getKey)])
		),
		_.uniques,
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

	let categories;
	let colorScale;
	let doDraw = false;
	let domain;
	let gridItems;
	let labelsByCategory;
	let legendBins;

	$: sorter =
		$_selection.categsGeoSortBy === 'regionName' ? getKey : getItemSum;
	$: sortItems = _.sortWith([
		$_selection.categsGeoSorting === 'desc'
			? _.sorterDesc(sorter)
			: sorter
	]);
	$: if (items?.length > 0) {

		/* common */

		gridItems = sortItems(reshapeItems(items));

		categories = getInnerCategs(gridItems);
		domain = getOverallExtent(items);
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
	}
</script>

<div class='threeRows'>
	<FlexBar>
		<SelectorRegionType />
		<SelectionXor
			name='categsGeoSortBy'
			values={['regionName', 'total']}
		/>
		<SelectionXor
			name='categsGeoSorting'
			values={['asc', 'desc']}
		/>
	</FlexBar>

	{#if doDraw}
		<LabelsGrid
			{categories}
			{labelsByCategory}
			minCellWidth = '15%'
		/>
		<div class='gridcontainer'>
			<Grid2Columns
				percents={[15, 85]}
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
				<ScrollableGrid
					{categories}
					{colorScale}
					{domain}
					{labelsByCategory}
					items={gridItems}
					shouldResetScroll={true}
					slot='col1'
				/>
			</Grid2Columns>
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
	.col1 {
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
</style>
