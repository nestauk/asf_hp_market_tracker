<script>
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
	import {makeStyleVars} from '@svizzle/dom';

	import {pairs} from 'd3-array';
	import {scaleLinear, scalePoint} from 'd3-scale';
	import * as _ from 'lamb';

	const defaultGeometry = {
		safetyBottom: 20,
		safetyLeft: 20,
		safetyRight: 20,
		safetyTop: 20,
	}

	const defaultTheme = {
		frameFill: 'none',
		frameStroke: 'black',
		gridStroke: 'lightgrey',
		gridStrokeDasharray: '4 8',
		textColor: 'black',
	}

	export let categories;
	export let categoriesFilterFn = _.identity;
	export let categoriesFormatFn;
	export let categoryToColorFn;
	export let geometry;
	export let items = [];
	export let sorting = 'off';
	export let theme;
	export let valueFormatFn;

	let height;
	let width;

	/* geometry */

	const labelsDx = 20;
	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: style = makeStyleVars(theme);

	/* geometry */

	$: geometry = geometry ? {...defaultGeometry, ...geometry} : defaultGeometry;
	$: labelsDy = Math.min(geometry.safetyBottom, geometry.safetyTop) / 2;

	/* items based */

	$: items = items ?? [];
	$: console.log(items);
	$: categoriesFilterFn = categoriesFilterFn || _.identity;

	const getSortedKeys = _.pipe([_.mapWith(getKey), _.sortWith([])]);
	$: allKeys = getSortedKeys(items).concat();
	$: keyTicks = _.filter(allKeys, categoriesFilterFn);

	const getMaxSum = arrayMaxWith(
		_.pipe([getValues, arraySumWith(getValue)])
	);
	$: maxSum = getMaxSum(items);
	$: yTicks = _.range(0, 1.1 * maxSum, 0.1 * maxSum);

	$: zeroedCategoriesMap = makeKeyedZeroes(categories);
	$: sortingFn = sorting === 'off'
		? _.identity
		: sorting === 'asc'
			? _.sortWith([getValue])
			: _.sortWith([_.sorterDesc(getValue)]);
	$: augmentValues = transformValues({
		values: _.pipe([
			keyValueArrayToObject,
			kvObject => _.merge(zeroedCategoriesMap, kvObject),
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
		])
	});
	$: augmentedItems = _.map(items, augmentValues);

	/* geometry based */

	const makeGetPaths = ({xScale, yScale}) => _.pipe([
		pairs,
		_.flatMapWith(
			_.pipe([
				_.flatMapWith(
					({key, values}) => _.map(values, value => ({key, value}))
				),
				_.groupBy(_.getPath('value.key')),
				_.mapValuesWith(
					_.pipe([
						_.sortWith([getKey]),
						([L, R]) => {
							const p1 = {x: xScale(L.key), y: yScale(L.value.end)};
							const p2 = {x: xScale(R.key), y: yScale(R.value.end)};
							const p3 = {x: xScale(R.key), y: yScale(R.value.start)};
							const p4 = {x: xScale(L.key), y: yScale(L.value.start)};
							const midX = (p1.x + p2.x) / 2;
							const c1 = {x: midX, y: p1.y};
							const c2 = {x: midX, y: p2.y};
							const c3 = {x: midX, y: p3.y};
							const c4 = {x: midX, y: p4.y};
							const M1 = `M ${p1.x} ${p1.y}`;
							const C12 = `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p2.x} ${p2.y}`;
							const L23 = `L ${p3.x} ${p3.y}`;
							const C34 = `C ${c3.x} ${c3.y} ${c4.x} ${c4.y} ${p4.x} ${p4.y}`;

							const path = `${M1} ${C12} ${L23} ${C34} Z`;
							const category = L.value.key;
							const fill = categoryToColorFn(category);

							return {
								category,
								data: [L, R],
								fill,
								id: `${L.key}_${R.key}_${category}`,
								path,
								range: [L.key, R.key],
							};
						},
					])
				),
				_.values
			])
		),
	]);

	let bbox;
	let doDraw = false;
	let paths = [];
	let xScale;
	let yScale;

	$: if (height && width && items) {
		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
			height: height - geometry.safetyTop - geometry.safetyBottom,
		}

		xScale = scalePoint().domain(allKeys).range([bbox.blx, bbox.trx]);
		yScale = scaleLinear().domain([0, maxSum]).range([bbox.bly, bbox.try]);

		const getPaths = makeGetPaths({xScale, yScale});
		paths = getPaths(augmentedItems);

		doDraw = true;
	}
</script>

<div
	{style}
	bind:clientHeight={height}
	bind:clientWidth={width}
	class='StreamGraph'
>
	{#if doDraw}
	<svg
		{height}
		{width}
	>
		<!-- grid -->
		<g class='grid'>
			{#each keyTicks as key}
				<line
					x1={xScale(key)}
					x2={xScale(key)}
					y1={bbox.bly}
					y2={bbox.try}
				/>
			{/each}
			{#each yTicks as value}
				<line
					x1={bbox.blx}
					x2={bbox.trx}
					y1={yScale(value)}
					y2={yScale(value)}
				/>
			{/each}
		</g>

		<!-- x-ticks -->

		<g class='x-ticks'>
			{#each keyTicks as key}
				<g class='ticks'>
					<text
						class='centered'
						dy={labelsDy}
						x={xScale(key)}
						y={bbox.bly}
					>
						{categoriesFormatFn(key)}
					</text>
					<text
						class='centered'
						dy={-labelsDy}
						x={xScale(key)}
						y={bbox.try}
					>
						{categoriesFormatFn(key)}
					</text>
				</g>
			{/each}
		</g>

		<!-- y-ticks -->
		<g class='y-ticks'>
			{#each yTicks as value}
				<g class='ticks'>
					<text
						class='left'
						dx={-labelsDx}
						x={bbox.blx}
						y={yScale(value)}
					>
						{valueFormatFn(value)}
					</text>
					<text
						class='right'
						dx={labelsDx}
						x={bbox.trx}
						y={yScale(value)}
					>
						{valueFormatFn(value)}
					</text>
				</g>
			{/each}
		</g>

		<!-- paths -->
		{#each paths as p (p.id)}
			<path
				fill={p.fill}
				d={p.path}
			/>
		{/each}

		<!-- frame -->
		<rect
			x={bbox.blx}
			y={bbox.try}
			width={bbox.width}
			height={bbox.height}
		/>
	</svg>
	{/if}
</div>

<style>
	.StreamGraph, svg {
		height: 100%;
		width: 100%;
	}

	.grid line {
		stroke: var(--gridStroke);
		stroke-dasharray: var(--gridStrokeDasharray);
	}

	.ticks text {
		dominant-baseline: middle;
		fill: var(--textColor);
		stroke: none;
		font-size: 0.75em;
	}
	text.centered {
		text-anchor: middle;
	}
	text.left {
		text-anchor: end;
	}
	text.right {
		text-anchor: start;
	}

	rect {
		stroke: var(--frameStroke);
		fill: var(--frameFill);
	}
</style>
