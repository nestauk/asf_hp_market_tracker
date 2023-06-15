<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {
		arrayMaxWith,
		arrayMinWith,
		getKey,
		getValue,
		getValues,
		inclusiveRange,
	} from '@svizzle/utils';
	import {scaleLinear, scalePoint, scaleTime} from 'd3-scale';
	import {line, curveMonotoneX} from 'd3-shape';
	import * as _ from 'lamb';

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

	// {key, values: {key, value}[]}[]
	// outer key is the trend name, inner key is the x key
	const defaultTrends = [{key: 'trend', values: []}];

	export let geometry;
	export let keyFilterFn;
	export let keyFormatFn = _.identity;
	export let keyToColorFn;
	export let keyType;
	export let preformatDate = _.identity;
	export let theme = null;
	export let trends;
	export let valueFormatFn;
	export let yTicksCount = 10;

	let height;
	let width;

	$: keyFormatFn = keyFormatFn ?? _.identity;
	$: preformatDate = preformatDate ?? _.identity;
	$: valueFormatFn = valueFormatFn ?? _.identity;
	$: yTicksCount = yTicksCount ?? 10;

	/* theme */

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: style = makeStyleVars(theme);

	/* geometry */

	const labelsDx = 20;
	$: geometry = geometry ? {...defaultGeometry, ...geometry} : defaultGeometry;
	$: labelsDy = Math.min(geometry.safetyBottom, geometry.safetyTop) / 2;

	/* data */

	$: trends = trends ?? defaultTrends;

	const getSortedKeys = _.pipe([
		_.flatMapWith(getValues),
		_.mapWith(getKey),
		_.uniques,
		_.sortWith([])
	]);
	$: allKeys = getSortedKeys(trends);

	const getMaxValue = arrayMaxWith(getValue);
	const getMinValue = arrayMinWith(getValue);

	$: allData = _.flatMap(trends, getValues);
	$: maxValue = getMaxValue(allData);
	$: maxValueSign = Math.sign(maxValue);
	$: minValue = getMinValue(allData);
	$: minValueSign = Math.sign(minValue);

	let yDelta;
	let yDomain;
	let yTicks;

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
		yTicks = inclusiveRange([...yDomain, yDelta / yTicksCount]);
	}

	let bbox;
	let doDraw = false;
	let keyTicks;
	let lineGenerator;
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

		lineGenerator = line()
			.x(d => xScale(getKey(d)))
			.y(d => yScale(getValue(d)))
			.curve(curveMonotoneX);

		doDraw = true;
	}
</script>

<div
	{style}
	bind:clientHeight={height}
	bind:clientWidth={width}
	class='Trends'
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

			{#each trends as {key, values} (key)}
				<path
					d={lineGenerator(values)}
					fill='none'
					stroke={keyToColorFn?.(key) ?? 'var(--curveStroke)'}
				/>
			{/each}

		</svg>
	{/if}
</div>

<style>
	.Trends, svg {
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
