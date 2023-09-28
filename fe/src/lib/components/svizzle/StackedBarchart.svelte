<script>
	import {_screen, setupResizeObserver} from '@svizzle/ui';
	import {
		applyFnMap,
		arrayMaxWith,
		arraySumWith,
		getKey,
		getValue,
		getValues,
		keyValueArrayToObject,
		makeKeyedZeroes,
		objectToKeyValueArray,
		transformValues,
	} from '@svizzle/utils';
	import {scaleLinear, scaleBand} from 'd3-scale';
	import * as _ from 'lamb';
	import {afterUpdate, createEventDispatcher} from 'svelte';

	import Scroller from '$lib/components/svizzle/Scroller.svelte';

	export let domain;
	export let extentsType;
	export let geometry;
	export let groupIds;
	export let groupSortBy;
	export let groupToColorFn;
	export let shouldResetScroll;
	export let stacks;
	export let theme;

	const defaultGeometry = {
		keyHeightEm: 3,
		padding: 0.9,
		safetyBottom: 8,
		safetyLeft: 8,
		safetyRight: 24,
		safetyTop: 8,
	}

	const defaultTheme = {
		textColor: 'black',
	}

	const dispatch = createEventDispatcher();

	const defaultBarColorFn = () => 'black';

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const getSum = _.pipe([getValues, arraySumWith(getValue)]);
	const getMaxSum = arrayMaxWith(getSum);

	let allKeys;
	let augmentedItems;
	let barsScaleByKey;
	let doDraw = false;
	let extraWidth = 0;
	let height;
	let keyHeight;
	let maxSum;
	let previousItems;
	let scrollTop;
	let width;
	let xScale;
	let yScale;

	afterUpdate(() => {
		if (shouldResetScroll && previousItems !== stacks) {
			scrollTop = 0;
			previousItems = stacks;
		}
	});

	// FIXME 1.5 is typical line-height, take from accessibility menu store?
	$: em = $_screen?.glyph.height / 1.5 || 16;
	$: theme = {...defaultTheme, ...theme};
	$: geometry = {...defaultGeometry, ...geometry};
	$: groupToColorFn = groupToColorFn || defaultBarColorFn;
	$: groupSortBy = groupSortBy || 'total';
	$: shouldResetScroll = shouldResetScroll || false;
	$: width = $_size.inlineSize - extraWidth;
	$: keyHeight = geometry.keyHeightEm * em;

	$: valueSortingFn = _.sortWith([_.sorterDesc(getValue)]);
	$: groupSortingFn = groupSortBy === 'total'
		? _.sortWith([_.sorterDesc(getSum)])
		: _.sortWith([getKey]);
	$: zeroedGroupMap = makeKeyedZeroes(groupIds);
	$: augmentValues = transformValues({
		values: _.pipe([
			keyValueArrayToObject,
			kvObject => _.merge(zeroedGroupMap, kvObject),
			objectToKeyValueArray,
			valueSortingFn,
			values => _.reduce(values, (acc, {key, value}) => {
				acc.array.push({
					key,
					value,
					start: acc.sum,
					end: acc.sum + value,
				});
				acc.sum += value;

				return acc;
			}, {array: [], sum: 0}),
		])
	});
	$: augmentItems = _.pipe([
		_.mapWith(_.pipe([
			augmentValues,
			applyFnMap({
				key: getKey,
				values: _.getPath('values.array'),
				sum: _.getPath('values.sum'),
			}),
		])),
		groupSortingFn
	]);
	$: if (stacks && augmentItems) {
		maxSum = getMaxSum(stacks);
		augmentedItems = augmentItems(stacks);
		allKeys = _.map(augmentedItems, getKey)
	}
	$: if (allKeys && width) {
		height = allKeys.length * keyHeight;
		const xRange = [geometry.safetyLeft, width - geometry.safetyRight];
		xScale = scaleLinear().domain([0, maxSum]).range(xRange);

		const getBarsScaleByKey = _.pipe([
			_.mapWith(_.collect([
				getKey,
				_.pipe([
					_.getKey('sum'),
					sum => scaleLinear().domain([0, sum]).range(xRange)
				])
			])),
			_.fromPairs
		]);

		barsScaleByKey = extentsType === 'percent'
			? getBarsScaleByKey(augmentedItems)
			: null;

		yScale = scaleBand()
			.domain(allKeys)
			.range([geometry.safetyTop, height - geometry.safetyBottom])
			.align(1)
			.paddingOuter(0.2)
			.paddingInner(geometry.padding);

		doDraw = true;
	}
</script>

<div
	class='StackedBarchart'
	use:sizeObserver
>
	{#if doDraw}
		<Scroller
			bind:extraWidth
			bind:outerScrollTop={scrollTop}
		>
			<svg {width} {height}>
				{#each augmentedItems as {key, values}}
					{@const barScale = barsScaleByKey?.[key] || xScale}
					<text
						class='key'
						x={geometry.safetyLeft}
						y={yScale(key) - 10}
						fill={theme.textColor}
					>
						{key}
					</text>
 					{#each values as {key: subKey, value, start}}
						<rect
							fill={groupToColorFn(subKey)}
							height={yScale.bandwidth()}
							on:mousemove={({x, y}) => {
								dispatch('barHovered', {key, subKey, value, x, y})
							}}
							on:mouseout={({x, y}) => {
								dispatch('barExited', {key, subKey, value, x, y})
							}}
							on:touchstart|preventDefault={({targetTouches: [touch]}) => {
								const {clientX: x, clientY: y} = touch;
								dispatch('barTouchStarted', {key, subKey, value, x, y})
							}}
							on:touchend={() => {
								dispatch('barTouchEnded', {key, subKey, value})
							}}
							width={barScale(value)}
							x={barScale(start)}
							y={yScale(key)}
						/>
					{/each}
				{/each}
			</svg>
		</Scroller>
	{/if}
</div>

<style>
	.StackedBarchart {
		display: grid;
		grid-template-rows: 1fr;
		height: 100%;
		width: 100%;
	}
</style>
