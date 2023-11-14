<script>
	import {setupResizeObserver, Scroller} from '@svizzle/ui';
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

	export let axesLabels;
	export let extentsType;
	export let geometry;
	export let groupIds;
	export let groupSortBy;
	export let groupToColorFn;
	export let shouldResetScroll;
	export let stacks;
	export let theme;

	const defaultGeometry = {
		glyphHeight: 16,
		glyphWidth: 8,
		keyHeightEm: 3,
		paddingInner: 0.9,
		paddingOuter: 0.2,
		safetyBottom: 8,
		safetyLeft: 8,
		safetyRight: 8,
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

	const truncate = (str, L) => str.length > L
		? `${str.substring(0, L - 3)}...`
		: str;

	const truncateToPx = (str, maxWidth, glyphWidth) => {
		const pxLength = str.length * glyphWidth;
		if (pxLength > maxWidth) {
			const L = Math.floor(maxWidth / glyphWidth) + 3; // Adding 3 for ellipsis
			return truncate(str, L);
		}
		return str;
	}

	let allKeys;
	let augmentedItems;
	let availableLabelWidth;
	let barsScaleByKey;
	let doDraw = false;
	let height;
	let keyHeight;
	let maxSum;
	let maxSumPxLength;
	let previousItems;
	let scrollbarWidth = 0;
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

	$: axesLabels = axesLabels ?? [];

	$: theme = {...defaultTheme, ...theme};
	$: geometry = {...defaultGeometry, ...geometry};
	$: groupToColorFn = groupToColorFn || defaultBarColorFn;
	$: groupSortBy = groupSortBy || 'total';
	$: shouldResetScroll = shouldResetScroll || false;
	$: width = $_size.inlineSize - scrollbarWidth;
	$: keyHeight = geometry.keyHeightEm * geometry.glyphHeight;

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
		const maxSumStringLength = maxSum.toString().length;
		maxSumPxLength = maxSumStringLength * geometry.glyphWidth;
		availableLabelWidth =
			width - geometry.safetyLeft - geometry.safetyRight - maxSumPxLength;
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
			.paddingOuter(geometry.paddingOuter)
			.paddingInner(geometry.paddingInner);

		doDraw = true;
	}
</script>

<div class='StackedBarchart'>
	<div
		class='chart'
		use:sizeObserver
	>
		{#if doDraw}
			<Scroller
				bind:outerScrollTop={scrollTop}
				bind:scrollbarWidth
			>
				<svg {width} {height}>
					{#each augmentedItems as {key, values, sum}}
						{@const barScale = barsScaleByKey?.[key] || xScale}

						<!-- label -->
						<text
							class='key'
							fill={theme.textColor}
							x={geometry.safetyLeft}
							y={yScale(key) - 10}
						>
							{truncateToPx(key, availableLabelWidth, geometry.glyphWidth)}
						</text>

						<!-- number -->
						<text
							class='sum'
							fill={theme.textColor}
							x={geometry.safetyLeft + width - geometry.safetyRight}
							y={yScale(key) - 10}
						>
							{sum}
						</text>

						<!-- bar rects -->
						{#each values as {key: subKey, value, start}}
							<!-- svelte-ignore a11y-mouse-events-have-key-events -->
							<rect
								role='none'
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

	{#each axesLabels as {label, areas}}
		{#each areas as area}
			<div class='{area} area'>
				{label}
			</div>
		{/each}
	{/each}
</div>

<style>
	.StackedBarchart {
		display: grid;
		grid-template-areas:
			'tl top tr'
			'left chart right'
			'bl bottom br';
		grid-template-columns: min-content 1fr min-content;
		grid-template-rows: min-content 1fr min-content;
		height: 100%;
		width: 100%;
	}

	svg {
		display: block;
	}

	text.sum {
		text-anchor: end;
	}

	.chart {
		grid-area: chart;
		overflow: hidden;
	}
	.bottom.area {
		grid-area: bottom;
	}
	.left.area {
		grid-area: left;
	}
	.right.area {
		grid-area: right;
	}
	.top.area {
		grid-area: top;
	}
	.left.area, .right.area, .top.area, .bottom.area {
		text-align: center;
	}
	.left.area, .right.area {
		writing-mode: vertical-lr;
		transform: rotate(180deg);
		transform-origin: 41% 50%;
	}
</style>
