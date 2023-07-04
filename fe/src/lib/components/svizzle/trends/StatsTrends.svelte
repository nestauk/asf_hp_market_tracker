<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {
		arrayMaxWith,
		arrayMinWith,
		getKey,
		getValues,
		inclusiveRange,
	} from '@svizzle/utils';
	import {scaleLinear, scalePoint, scaleTime} from 'd3-scale';
	import {area, line, curveMonotoneX} from 'd3-shape';
	import * as _ from 'lamb';

	import {pluckKey} from '$lib/utils/svizzle/utils.js';

	const defaultGeometry = {
		safetyBottom: 20,
		safetyLeft: 20,
		safetyRight: 20,
		safetyTop: 20,
	}

	const defaultTheme = {
		curveStroke: 'black',
		curveStrokeWidth: 2,

		// frame theme
		frameFill: 'none',
		frameStroke: 'black',
		gridStroke: 'lightgrey',
		gridStrokeDasharray: '4 8',
		textColor: 'black',
	}

	const defaultItems = []; // {key, values: {min, max, avg, '1.0', ...}}[]

	export let areaLowKeyToColor;
	export let config;
	export let geometry;
	export let items = defaultItems;
	export let keyFilterFn;
	export let keyFormatFn = _.identity;
	export let keyToColorFn;
	export let keyType;
	export let preformatDate = _.identity;
	export let theme = null;
	export let valueFormatFn;
	export let yTicksCount = 10;

	let height;
	let width;

	$: items = items ?? defaultItems;
	$: keyFormatFn = keyFormatFn ?? _.identity;
	$: preformatDate = preformatDate ?? _.identity;
	$: yTicksCount = yTicksCount ?? 10;

	/* theme */

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: style = makeStyleVars(theme);

	/* geometry */

	const labelsDx = 20;
	$: geometry = geometry ? {...defaultGeometry, ...geometry} : defaultGeometry;
	$: labelsDy = Math.min(geometry.safetyBottom, geometry.safetyTop) / 2;

	/* data */

	const getSortedKeys = _.pipe([
		pluckKey,
		_.uniques,
		_.sortWith()
	]);
	$: allKeys = getSortedKeys(items);

	const getMaxValue = arrayMaxWith(_.getPath('values.max'));
	const getMinValue = arrayMinWith(_.getPath('values.min'));

	$: maxValue = getMaxValue(items);
	$: maxValueSign = Math.sign(maxValue);
	$: minValue = getMinValue(items);
	$: minValueSign = Math.sign(minValue);

	let yDomain;
	let yDelta;
	$: {
		if (maxValueSign !== minValueSign) {
			yDomain = [minValue, maxValue];
			yDelta = maxValue - minValue;
		} else if (maxValueSign === 1) {
			yDomain = [0, maxValue];
			yDelta = maxValue;
		} else {
			yDomain = [minValue, 0];
			yDelta = -minValue;
		}
	}
	$: yTicks = inclusiveRange([...yDomain, yDelta / yTicksCount]);

	let areas;
	let bbox;
	let doDraw = false;
	let keyTicks;
	let lines;
	let xScale;
	let yScale;

	$: if (height && width) {
		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
			height: height - geometry.safetyTop - geometry.safetyBottom,
		}

		const xRange = [bbox.blx, bbox.trx];
		if (keyType === 'date') {
			const keyDomain = [_.head(allKeys), _.last(allKeys)];
			const keyRankFn = key => (new Date(key)).getTime();
			const timeDomain = _.map(keyDomain, keyRankFn);
			const timeScale = scaleTime().domain(timeDomain).range(xRange);

			keyTicks = _.map(timeScale.ticks(), preformatDate);
			xScale = _.pipe([keyRankFn, timeScale]);
		} else {
			keyTicks = keyFilterFn ? _.filter(allKeys, keyFilterFn) : allKeys;
			xScale = scalePoint().domain(allKeys).range(xRange);
		}

		yScale = scaleLinear().domain(yDomain).range([bbox.bly, bbox.try]);

		const getX = _.pipe([getKey, xScale]);

		areas = _.map(
			config.areas,
			([lowKey, highKey]) => ({
				color: areaLowKeyToColor(lowKey),
				generator: area()
					.x(getX)
					.y0(_.pipe([getValues, _.getKey(lowKey), yScale]))
					.y1(_.pipe([getValues, _.getKey(highKey), yScale]))
					.curve(curveMonotoneX),
				lowKey
			})
		);

		lines = _.map(
			config.trends,
			key => ({
				key,
				generator: line()
					.x(getX)
					.y(_.pipe([getValues, _.getKey(key), yScale]))
					.curve(curveMonotoneX)
			})
		);

		doDraw = true;
	}
</script>

<div
	{style}
	bind:clientHeight={height}
	bind:clientWidth={width}
	class='StatsTrends'
>
	{#if doDraw}
		<svg
			{height}
			{width}
		>
			<!-- grid -->
			<g class='grid'>
				<g class='vertical'>
					{#each keyTicks as key}
						<line
							x1={xScale(key)}
							x2={xScale(key)}
							y1={bbox.bly}
							y2={bbox.try}
						/>
					{/each}
				</g>
				<g class='horizontal'>
					{#each yTicks as value}
						<line
							x1={bbox.blx}
							x2={bbox.trx}
							y1={yScale(value)}
							y2={yScale(value)}
						/>
					{/each}
				</g>
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
							{keyFormatFn?.(key) ?? key}
						</text>
						<text
							class='centered'
							dy={-labelsDy}
							x={xScale(key)}
							y={bbox.try}
						>
							{keyFormatFn?.(key) ?? key}
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

			<!-- frame -->
			<rect
				x={bbox.blx}
				y={bbox.try}
				width={bbox.width}
				height={bbox.height}
			/>

			<!-- areas -->
			{#each areas as {color, generator, lowKey} (lowKey)}
				<path
					d={generator(items)}
					fill={color}
				/>
			{/each}

			<!-- lines -->
			{#each lines as {generator, key} (key)}
				<path
					d={generator(items)}
					fill='none'
					stroke={keyToColorFn?.(key) ?? 'var(--curveStroke)'}
				/>
			{/each}

		</svg>
	{/if}
</div>

<style>
	.StatsTrends, svg {
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

	path {
		stroke-width: var(--curveStrokeWidth);
	}
</style>
