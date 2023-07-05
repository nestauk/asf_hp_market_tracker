<script>
	import {
		arraySumWith,
		getId,
		getKey,
		getValue,
		getValues,
		makeWithKeys,
	} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import KeysLegend
		from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import StackedBarchart
		from '$lib/components/svizzle/StackedBarchart.svelte';
	import SelectionXor
		from '$lib/components/explorer/medium/SelectionXor.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/medium/SelectorRegionType.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import {_selection} from '$lib/stores/navigation.js';
	import {_legendsTheme, _stackedBarchartTheme} from '$lib/stores/theme.js';
	import {
		objectToKeyValuesArray,
		pluckKeySorted
	} from '$lib/utils/svizzle/utils.js';

	export let keyAccessor;
	export let keyAccessor2;
	export let items;
	export let valueAccessor;
	export let valueAccessor2;

	const flattenItems = _.flatMapWith(
		_.pipe([
			_.collect([keyAccessor, valueAccessor]),
			([key, points]) => _.map(points,
				point => ({
					id: keyAccessor2(point),
					key,
					value: valueAccessor2(point),
				})
			)
		])
	); // {id, key, value}[]

	const getGroupSum = _.pipe([getValues, arraySumWith(getValue)]);
	const getPointsByGroupId = _.pipe([
		_.groupBy(getId),
		objectToKeyValuesArray,
		_.sortWith([_.sorterDesc(getGroupSum)]),
	]);
	const flattenGroups = _.flatMapWith(getValues);

	const getStacks = _.pipe([
		_.groupBy(getKey),
		objectToKeyValuesArray,
		_.mapWith(
			({key, values}) => ({
				key,
				values: _.map(values, ({id, value}) => ({key: id, value}))
			})
		),
		_.sortWith([_.sorterDesc(getGroupSum)]),
	]);

	const getEnumeratedMapping = _.pipe([
		_.zipWithIndex,
		_.mapWith(_.collect([
			_.head,
			_.pipe([
				_.last,
				_.add(1)
			])
		])),
		_.fromPairs
	]);

	let doDraw = false;
	let domain;
	let groupIds;
	let groupToColorFn;
	let labelsByCategory;
	let legendBins;
	let stacks;

	$: cropGroups = _.take($_selection.stringsTopCount);
	$: if (items?.length > 0) {
		const allPoints = flattenItems(items);
		const pointsByGroupId = cropGroups(getPointsByGroupId(allPoints));
		const points = flattenGroups(pointsByGroupId);

		groupIds = pluckKeySorted(pointsByGroupId);
		labelsByCategory = getEnumeratedMapping(groupIds);

		stacks = getStacks(points);
		domain = extent(points, getValue);

		/* color */

		const colorScheme = groupIds.map((category, index) =>
			interpolateColor(index / (groupIds.length - 1))
		);
		groupToColorFn = scaleOrdinal().domain(groupIds).range(colorScheme);

		/* legend */

		legendBins = _.map(
			_.zip(groupIds, colorScheme),
			makeWithKeys(['groupIds', 'color'])
		);

		doDraw = true;
	}
</script>

<div class='twoRows'>
	<FlexBar>
		<SelectorRegionType />
		<SelectionXor
			name='stringsGeoSortBy'
			values={['total', 'regionName']}
		/>
		<SelectionXor
			name='stackedBarsExtents'
			values={['absolute', 'percent']}
		/>
	</FlexBar>

	{#if doDraw}
		<div class='gridcontainer'>
			<Grid2Columns
				percents={[25, 75]}
				gap='0.25em'
			>
				<KeysLegend
					keys={groupIds}
					keyToColorFn={groupToColorFn}
					slot='col0'
				/>

				<StackedBarchart
					{domain}
					{groupIds}
					{groupToColorFn}
					{stacks}
					extentsType={$_selection.stackedBarsExtents}
					groupSortBy={$_selection.stringsGeoSortBy}
					shouldResetScroll={true}
					slot='col1'
					theme={$_stackedBarchartTheme}
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
	.twoRows {
		display: grid;
		gap: 1.5em;
		grid-template-rows: min-content 1fr;
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
	.gridcontainer {
		overflow: hidden;
	}
</style>
