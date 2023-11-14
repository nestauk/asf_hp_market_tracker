<script>
	import {ColorBinsDiv} from '@svizzle/legend';
	// import {Scroller} from '@svizzle/ui';
	import {
		arraySumWith,
		getId,
		getKey,
		getValue,
		getValues,
		keyValueArrayToObject,
		makeWithKeys,
	} from '@svizzle/utils';
	import {extent, pairs} from 'd3-array';
	import {scaleQuantize} from 'd3-scale';
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
		_currThemeVars,
		_keysLegendTheme,
		_legendsTheme,
		_stackedBarchartTheme,
	} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {
		objectToKeyValuesArray,
		pluckKeySorted
	} from '$lib/utils/svizzle/utils.js';

	export let amountOfBins = 5;
	export let formatFn;
	export let items;
	export let keyAccessor;
	export let keyAccessor2;
	export let valueAccessor;
	export let valueAccessor2;

	const axesLabels = [
		{
			areas: ['bottom'],
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

	const getSumsById = _.pipe([
		_.groupBy(getId),
		objectToKeyValuesArray,
		_.mapWith(
			({key, values}) => ({
				key,
				value: arraySumWith
				(_.identity)
				(_.map(values, ({value}) => value))
			})
		)
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

	const clearHero = () => {
		heroKey = null;
	};
	const setHero = key => {
		heroKey = key;
	};

	const onBarEntered = ({detail: {subKey, value, x, y}}) => {
		$_tooltip = {
			key: subKey,
			value,
			x,
			y,
		};
		setHero(subKey);
	};
	const onBarHovered = ({detail: {subKey, value, x, y}}) => {
		$_tooltip = {
			key: subKey,
			value,
			x,
			y,
		};
	};

	const onBarExited = () => {
		clearTooltip();
		clearHero();
	};

	let colorScale;
	let doDraw = false;
	let domain;
	let groupIds;
	let groupToColorFn;
	let heroKey;
	let isSingleValue;
	let keyToColorFn;
	let labelsByCategory;
	let legendBins;
	let legendKeys;
	let stacks;

	$: if (items?.length > 0) {
		const allPoints = flattenItems(items);
		const pointsByGroupId = getPointsByGroupId(allPoints);
		const points = flattenGroups(pointsByGroupId);

		groupIds = pluckKeySorted(pointsByGroupId);
		labelsByCategory = getEnumeratedMapping(groupIds);

		stacks = getStacks(points);
		const sumsById = getSumsById(points);
		domain = extent(_.map(sumsById, getValue));

 		/* color */

		isSingleValue = domain[0] === domain[1];
		const range = isSingleValue
			? [0]
			: _.range(0, 1, 1 / (amountOfBins - 1)).concat(1);
		const colorScheme = _.map(range, interpolateColor);
		colorScale = scaleQuantize().domain(domain).range(colorScheme);

		const groupsIndex = keyValueArrayToObject(sumsById)
		groupToColorFn = group => colorScale(groupsIndex[group]);

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

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='legend'>
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<Scroller
					alignHorizontally={true}
					alignVertically={true}
				>
					<KeysLegend keys={groupIds} />
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
					on:barEntered={onBarEntered}
					on:barExited={clearTooltip}
					on:barHovered={onBarHovered}
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
					alignHorizontally={true}
					alignVertically={true}
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
				colLayout='10% 68% 20%'
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

				<StackedBarchart
					{axesLabels}
					{domain}
					{groupIds}
					{groupToColorFn}
					{stacks}
					extentsType={$_selection.stackedBarsExtents}
					groupSortBy={$_selection.stringsGeoSortBy}
					heroGroup={heroKey}
					on:barEntered={onBarEntered}
					on:barExited={onBarExited}
					on:barHovered={onBarHovered}
					on:barTouchStarted={onBarEntered}
					shouldResetScroll={true}
					theme={$_stackedBarchartTheme}
				/>

				<Scroller alignVertically={true}>
					<KeysLegend
						{heroKey}
						keys={groupIds}
						keyToColorFn={groupToColorFn}
						on:keyEntered={({detail}) => setHero(detail)}
						on:keyExited={clearHero}
						theme={$_keysLegendTheme}
					/>
				</Scroller>

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
</style>
