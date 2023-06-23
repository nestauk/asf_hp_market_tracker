<script>
	import {_screen, setupResizeObserver} from '@svizzle/ui';
	import {
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
	import {afterUpdate} from 'svelte';

	import Scroller from '$lib/components/svizzle/Scroller.svelte';

	export let domain;
	export let geometry;
	export let groupIds;
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

	const defaultBarColorFn = () => 'black';

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const getSum = _.pipe([getValues, arraySumWith(getValue)]);
	const getMaxSum = arrayMaxWith(getSum);

	let allKeys;
	let augmentedItems;
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
	$: shouldResetScroll = shouldResetScroll || false;
	$: width = $_size.inlineSize - extraWidth;
	$: keyHeight = geometry.keyHeightEm * em;

	$: sortingFn = _.sortWith([_.sorterDesc(getValue)]);
	$: zeroedGroupMap = makeKeyedZeroes(groupIds);
	$: augmentValues = transformValues({
		values: _.pipe([
			keyValueArrayToObject,
			kvObject => _.merge(zeroedGroupMap, kvObject),
			objectToKeyValueArray,
			sortingFn,
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
			_.getKey('array'),
		]),
	});
	$: augmentItems = _.pipe([
		_.mapWith(augmentValues),
		_.sortWith([_.sorterDesc(getSum)]),
	]);

	$: if (stacks && augmentItems) {
		maxSum = getMaxSum(stacks);
		augmentedItems = augmentItems(stacks);
		allKeys = _.map(augmentedItems, getKey)
	}
	$: if (allKeys && width) {
		height = allKeys.length * keyHeight;
		xScale = scaleLinear()
			.domain([0, maxSum])
			.range([geometry.safetyLeft, width - geometry.safetyRight]);
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
	class='ScrollableGrid'
	use:sizeObserver
>
	{#if doDraw}
		<Scroller
			bind:extraWidth
			bind:outerScrollTop={scrollTop}
		>
			<svg {width} {height}>
				{#each augmentedItems as {key, values}}
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
							x={xScale(start)}
							y={yScale(key)}
							width={xScale(value)}
							height={yScale.bandwidth()}
							fill={groupToColorFn(subKey)}
						/>
					{/each}
				{/each}
			</svg>
		</Scroller>
	{/if}
</div>

<style>
	.ScrollableGrid {
		display: grid;
		grid-template-rows: 1fr;
		height: 100%;
		width: 100%;
	}
</style>
