<script>
	import {setupResizeObserver} from '@svizzle/ui';
	import {getKey} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleLinear, scaleUtc} from 'd3-scale';
	import * as _ from 'lamb';

	import {_staticData} from '$lib/stores/data.js';
	import {_filters, updateFilter} from '$lib/stores/filters.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {formatDate} from '$lib/utils/date.js';
	import {getDocCount} from '$lib/utils/getters.js';
	import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

	const geometry = {
		safetyBottom: 0,
		safetyLeft: 40,
		safetyRight: 40,
		safetyTop: 30,
	};

	const knobStrokeWidth = 2;
	const knobRadius = 4;
	const sensors = {
		maxSemiWidth: 35
	};

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const getTimeDomain = _.pipe([
		pluckKeySorted,
		_.collect([_.take(2), _.last]),
		([[first, second], last]) => [first, last + second - first]
	]);

	/* range selection */
	const getClosestTick = (ticks, value) => {
		const diffs = _.map(
			ticks,
			(tick, i) => [Math.abs(tick.getTime() - value), i]
		)
		const sorted = _.sort(diffs, [_.getAt(0)]);
		const [[, smallest]] = sorted;
		return ticks[smallest];
	}
	const updateMinMax = () => {
		if (!min || !max) {
			return;
		}
		min = getClosestTick(selectionTicks, min);
		max = getClosestTick(selectionTicks, max);
	}

	const handleMinDrag = event => {
		const value = Math.min(
			Math.max(knobGeometry.x1, event.offsetX - geometry.safetyLeft),
			xScale(max)
		);
		min = xScale.invert(value);
		const closestTick = getClosestTick(selectionTicks, min.getTime());
		cursorX = xScale(closestTick);
	}
	const handleMaxDrag = event => {
		const value = Math.max(
			Math.min(knobGeometry.x2, event.offsetX - geometry.safetyLeft),
			xScale(min)
		);
		max = xScale.invert(value);
		const closestTick = getClosestTick(selectionTicks, max.getTime());
		cursorX = xScale(closestTick);
	}

	const createStartDragging = ({isMinKnob}) => event => {
		isMinDragging = isMinKnob;
		event.target.onpointermove = isMinKnob ? handleMinDrag : handleMaxDrag;
		event.target.setPointerCapture(event.pointerId);
	}
	const stopDragging = event => {
		event.target.onpointermove = null;
		event.target.releasePointerCapture(event.pointerId);
		cursorX = null;
		updateFilter(
			'Installation',
			'installation_date',
			{
				min: min.getTime(),
				max: max.getTime()
			}
		);
	}

	let barWidth;
	let bbox;
	let bins;
	let cursorX;
	let fontSize;
	let isMinDragging;
	let items;
	let knobGeometry;
	let Max;
	let maxX;
	let Min;
	let minX;
	let selectionTicks;
	let xScale;
	let xTicks;

	$: ({inlineSize: width, blockSize: height} = $_size);
	$: proceed = height && width && $_staticData?.timelines;

	$: if (proceed) {
		items = $_staticData.timelines[$_selection.interval];

		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			height: height - geometry.safetyTop - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
		};

		const timeDomain = getTimeDomain(items);
		xScale =
			scaleUtc()
			.domain(timeDomain)
			.range([0, bbox.width]);
		minX = xScale(min);
		maxX = xScale(max);

		sensors.dynamicWidth = Math.min(sensors.maxSemiWidth, (maxX - minX) / 2);
		sensors.width = sensors.maxSemiWidth + sensors.dynamicWidth;
		sensors.xMin = minX - sensors.maxSemiWidth;
		sensors.xMax = maxX - sensors.dynamicWidth;

		barWidth = xScale(getKey(items[1])) - xScale(getKey(items[0]));

		const [, dMax] = extent(items, getDocCount);
		const yScale = scaleLinear().domain([0, dMax]).range([0, bbox.height]);

		selectionTicks = xScale.ticks(items.length + 1);
		[Min, Max] = timeDomain;
		!min && (min = Min);
		!max && (max = Max);

		bins = _.map(items, ({key, doc_count}) => {
			const barHeight = yScale(doc_count);
			const x = xScale(key);

			return {
				height: barHeight,
				selected: x >= minX && x < maxX,
				width: barWidth,
				x,
				y: bbox.height - barHeight,
			}
		});

		fontSize = geometry.safetyTop / 2;
		xTicks = _.map(xScale.ticks(), date => ({
			dy: -geometry.safetyTop / 4,
			label: formatDate(date),
			x: xScale(date),
		}));
	}

	$: $_selection.interval && selectionTicks && updateMinMax();

	$: min = min || Min;
	$: max = max || Max;
	$: max < min && (max = min);

	$: knobGeometry = {x1: knobStrokeWidth / 2 /* + knobRadius */};
	$: bbox && (knobGeometry.x2 = bbox.width - knobGeometry.x1);
</script>

<div
	class='TimeLine'
	use:sizeObserver={'contentBoxSize'}
	style='font-size:{fontSize}; --knobStrokeWidth:{knobStrokeWidth}px;'
>
	{#if proceed}
		<svg
			{height}
			{width}
		>
			<g transform='translate({bbox.blx},{bbox.try})'>
				<g class='xTicks'>
					{#each xTicks as {dy, label, x}}
						<text
							{dy}
							{x}
						>
							{label}
						</text>
						<line
							x1={x}
							x2={x}
							y2={bbox.height}
						/>
					{/each}
				</g>

				<g class='bins'>
					{#each bins as {height, selected, width, x, y}}
						<rect
							{height}
							{width}
							{x}
							{y}
							class:selected
						/>
					{/each}
				</g>

				<!-- Range selectors -->

				<rect
					class='sensor'
					height={bbox.height}
					width={sensors.width}
					x={sensors.xMin}
					on:pointerdown={createStartDragging({isMinKnob: true})}
					on:pointerup={stopDragging}
				/>
				<line
					class='cursor'
					x1={minX}
					x2={minX}
					y2={bbox.height}
					stroke='var(--colorBorderAux)'
				/>
				<circle
					class='knob min'
					cx={minX}
					cy={knobGeometry.x1 + bbox.height / 2}
					r={knobRadius}
				/>

				<rect
					class='sensor'
					height={bbox.height}
					width={sensors.width}
					x={sensors.xMax}
					on:pointerdown={createStartDragging({isMinKnob: false})}
					on:pointerup={stopDragging}
				/>
				<line
					class='cursor'
					x1={maxX}
					x2={maxX}
					y2={bbox.height}
					stroke='var(--colorBorderAux)'
				/>
				<circle
					class='knob max'
					cx={maxX}
					cy={knobGeometry.x1 + bbox.height / 2}
					r={knobRadius}
				/>
			</g>
		</svg>
	{/if}
</div>

<style>
	.TimeLine {
		height: 100%;
		width: 100%;
		user-select: none;
	}

	.xTicks text {
		fill: var(--colorText);
		stroke: none;
		text-anchor: middle;
	}
	.xTicks line {
		stroke-dasharray: var(--gridStrokeDasharray);
		stroke: var(--colorBorder);
	}

	.bins rect {
		fill: var(--colorTimelineInactiveBinFill);
		stroke: var(--colorTimelineInactiveBinStroke);
	}
	.bins rect.selected {
		fill: var(--colorTimelineActiveBinFill);
		stroke: var(--colorTimelineActiveBinStroke);
	}
	.sensor {
		cursor: pointer;
		fill: transparent;
	}
	.knob {
		cursor: pointer;
		fill: var(--colorSwitchKnob);
		pointer-events: none;
		stroke-width: var(--knobStrokeWidth);
		stroke: var(--colorBorderAux);
	}
	.cursor {
		pointer-events: none;
		stroke-width: var(--knobStrokeWidth);
	}
</style>
