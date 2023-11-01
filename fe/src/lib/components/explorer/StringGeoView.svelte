<script>
	// import {Scroller} from '@svizzle/ui';
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
	import * as _ from 'lamb';

	import KeysLegend
		from '$lib/components/svizzle/legend/KeysLegend.svelte';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import StackedBarchart
		from '$lib/components/svizzle/StackedBarchart.svelte';
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/SelectorRegionType.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import GridColumns from '$lib/components/svizzle/GridColumns.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Scroller from '$lib/components/svizzle/ui/Scroller.svelte';
	import {interpolateColor} from '$lib/config/colors.js';
	import {_glyphGeometry} from '$lib/stores/geometry.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {
		_legendsTheme,
		_stackedBarchartTheme,
		_currThemeVars,
	} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {
		objectToKeyValuesArray,
		pluckKeySorted
	} from '$lib/utils/svizzle/utils.js';

	export let items;
	export let keyAccessor;
	export let keyAccessor2;
	export let valueAccessor;
	export let valueAccessor2;

	const axesLabels = [
		{
			areas: ['top'],
			label: 'Sum of the number of installations of selected brands in each region',
		},
		{
			areas: ['left'],
			label: 'Regions',
		},
	];

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

	const onBarEntered = ({detail: {subKey, value, x, y}}) => {
		$_tooltip = {
			key: subKey,
			value,
			x,
			y,
		};
	};

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

		const range = groupIds.length === 1
			? [0]
			: _.range(0, 1, 1 / (groupIds.length - 1)).concat(1);
		const colorScheme = _.map(range, interpolateColor);
		groupToColorFn = scaleOrdinal().domain(groupIds).range(colorScheme);

		/* legend */

		legendBins = _.map(
			_.zip(groupIds, colorScheme),
			makeWithKeys(['groupIds', 'color'])
		);

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Scroller
					isCenteredHorizontally={true}
					isCenteredVertically={true}
				>
					<KeysLegend
						keys={groupIds}
						keyToColorFn={groupToColorFn}
					/>
				</Scroller>
			</GridRows>
		</View>

		<View id='barchart'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<StackedBarchart
					{domain}
					{groupIds}
					{groupToColorFn}
					{stacks}
					extentsType={$_selection.stackedBarsExtents}
					geometry={$_glyphGeometry}
					groupSortBy={$_selection.stringsGeoSortBy}
					on:barExited={clearTooltip}
					on:barHovered={onBarEntered}
					on:barTouchStarted={onBarEntered}
					shouldResetScroll={true}
					theme={$_stackedBarchartTheme}
				/>
			</GridRows>
		</View>

		<View id='settings'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Scroller
					isCenteredHorizontally={true}
					isCenteredVertically={true}
				>
					<SelectorRegionType />
					<SelectionXor
						name='stringsGeoSortBy'
						valuesToLabels={{
							total: 'Total',
							regionName: 'Region name'
						}}
					/>
					<SelectionXor
						name='stackedBarsExtents'
						valuesToLabels={{
							absolute: 'Absolute',
							percent: 'Percent'
						}}
					/>
				</Scroller>
			</GridRows>
		</View>
	{/if}
{:else}
	<GridRows rowLayout='min-content 1fr'>
		<FlexBar canWrap>
			<SelectorRegionType />
			<SelectionXor
				name='stringsGeoSortBy'
				valuesToLabels={{
					total: 'Total',
					regionName: 'Region name'
				}}
			/>
			<SelectionXor
				name='stackedBarsExtents'
				valuesToLabels={{
					absolute: 'Absolute',
					percent: 'Percent'
				}}
			/>
		</FlexBar>

		{#if doDraw}
			<GridColumns
				colLayout='25% 74%'
				gap='1%'
			>
				<Scroller isCenteredVertically={true}>
					<KeysLegend
						keys={groupIds}
						keyToColorFn={groupToColorFn}
					/>
				</Scroller>

				<StackedBarchart
					{axesLabels}
					{domain}
					{groupIds}
					{groupToColorFn}
					{stacks}
					extentsType={$_selection.stackedBarsExtents}
					groupSortBy={$_selection.stringsGeoSortBy}
					on:barExited={clearTooltip}
					on:barHovered={onBarEntered}
					on:barTouchStarted={onBarEntered}
					shouldResetScroll={true}
					theme={$_stackedBarchartTheme}
				/>
			</GridColumns>
		{/if}
	</GridRows>
{/if}
