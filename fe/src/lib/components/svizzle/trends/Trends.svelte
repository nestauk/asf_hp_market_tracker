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
	import {createEventDispatcher} from 'svelte';

	import {pluckKey} from '$lib/utils/svizzle/utils.js';

	import {getDateTimeFormat} from './utils.js';

	const dispatch = createEventDispatcher();

	const defaultGeometry = {
		dotRadius: 2,
		safetyBottom: 20,
		safetyLeft: 20,
		safetyRight: 20,
		safetyTop: 20,
	}

	const defaultTheme = {
		curveStroke: 'black',
		curveStrokeWidth: 1,

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
	export let trendType; // 'progressive' | 'cumulative'
	export let valueFormatFn;
	export let xAxisLabel;
	export let yAxisLabel;
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
	$: if (trendType === 'cumulative') {
		trends = _.map(trends, ({key, values}) => {
			const cumulativeValues = _.reduce(
				values,
				(acc, {key, value}) => {
					acc.sum += value;
					acc.array.push({key, value: acc.sum});

					return acc;
				},
				{sum: 0, array: []}
			).array;

			return {key, values: cumulativeValues}
		});
	}

	const getSortedKeys = _.pipe([
		_.flatMapWith(getValues),
		pluckKey,
		_.uniques,
		_.sortWith()
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
	let dotRadius;
	let keyTicks;
	let lineGenerator;
	let xScale;
	let yScale;

	$: if (height && width) {
		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			height: height - geometry.safetyTop - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
		}

		const xRange = [bbox.blx, bbox.trx];
		if (keyType === 'date') {
			const keyDomain = [_.head(allKeys), _.last(allKeys)];
			const keyRankFn = key => (new Date(key)).getTime();
			const timeDomain = _.map(keyDomain, keyRankFn);
			const timeScale = scaleTime().domain(timeDomain).range(xRange);

			const ticks = timeScale.ticks();
			const tickDurationInSecs =
				(timeDomain[1] - timeDomain[0]) / 1000 / (ticks.length - 1);
			const timeFormat = getDateTimeFormat(tickDurationInSecs);
			keyTicks = _.map(ticks, _.collect([_.identity, timeFormat]));

			xScale = _.pipe([keyRankFn, timeScale]);
		} else {
			keyTicks = _.map(
				keyFilterFn ? _.filter(allKeys, keyFilterFn) : allKeys,
				_.collect([_.identity, keyFormatFn])
			);
			xScale = scalePoint().domain(allKeys).range(xRange);
		}

		dotRadius = allKeys.length === 1
			? geometry.dotRadius
			: Math.min(
				(xScale(allKeys[1]) - xScale(allKeys[0])) / 3,
				geometry.dotRadius
			);

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
	class='Trends'
>
	<div
		bind:clientHeight={height}
		bind:clientWidth={width}
		class='chart'
	>
		{#if doDraw}
			<svg
				{height}
				{width}
			>
				<!-- grid -->
				<g class='grid'>
					<g class='vertical'>
						{#each keyTicks as [key]}
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
					{#each keyTicks as [key, label]}
						<g class='ticks'>
							<text
								class='centered'
								dy={labelsDy}
								x={xScale(key)}
								y={bbox.bly}
							>
								{label}
							</text>
							<text
								class='centered'
								dy={-labelsDy}
								x={xScale(key)}
								y={bbox.try}
							>
								{label}
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

					{#each values as data}
						<circle
							cx={xScale(getKey(data))}
							cy={yScale(getValue(data))}
							fill={keyToColorFn?.(key) ?? 'var(--curveStroke)'}
							on:mousemove={({x, y}) => {
								dispatch('dotHovered', {data, x, y})
							}}
							on:mouseout={({x, y}) => {
								dispatch('dotExited', {data, x, y})
							}}
							on:touchstart|preventDefault={({targetTouches: [touch]}) => {
								const {clientX: x, clientY: y} = touch;
								dispatch('dotTouchStarted', {data, x, y})
							}}
							on:touchend={() => {
								dispatch('dotTouchEnded', {data})
							}}
							r={dotRadius}
						/>

					{/each}
				{/each}
			
			</svg>
		{/if}
	</div>
	
	{#if xAxisLabel}
		<div class='xAxisLabel'>
			{xAxisLabel}
		</div>
	{/if}

	{#if yAxisLabel}
		<div class='yAxisLabel'>
			{yAxisLabel}
		</div>
	{/if}
</div>

<style>
	.Trends{
		height: 100%;
		width: 100%;
		overflow: hidden;
		display: grid;
		grid-template-areas:
			'tlcorner topLabel trcorner'
			'leftLabel chart rightLabel'
			'blcorner bottomLabel brcorner';
		grid-template-columns: min-content 1fr min-content;
		grid-template-rows: min-content 1fr min-content;
	}
	svg {
		height: 100%;
		width: 100%;
	}
	.chart {
		grid-area: chart;
		overflow: hidden;
	}
	.xAxisLabel {
		grid-area: bottomLabel;
		text-align: center;
	}
	.yAxisLabel {
		grid-area: rightLabel;
		text-align: center;
		writing-mode: vertical-lr;
		transform: rotate(180deg);
		transform-origin: 41% 50%;
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
