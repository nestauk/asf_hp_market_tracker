<script>
	import {setupResizeObserver} from '@svizzle/ui';
	import {getKey} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleLinear, scaleUtc} from 'd3-scale';
	import * as _ from 'lamb';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_staticData} from '$lib/stores/data.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_installationDateExtent} from '$lib/stores/filters.js';
	import {formatDate} from '$lib/utils/date.js';
	import {getDocCount} from '$lib/utils/getters.js';

	const geometry = {
		safetyBottom: 0,
		safetyLeft: 40,
		safetyRight: 40,
		safetyTop: 30,
	};
	const fontSize = geometry.safetyTop / 2;

	const knobStrokeWidth = 2;
	const knobRadius = 6;
	const sensors = {
		maxSemiWidth: 35
	};

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	/* range selection */

	const getClosestTickIndex = (ticks, value) => {
		const diffs = _.map(
			ticks,
			(tick, i) => [Math.abs(tick.getTime() - value), i]
		);
		const sorted = _.sort(diffs, [_.head]);
		const [[, index]] = sorted;

		return index;
	}

	const handleMinDrag = event => {
		const value = xScale.invert(event.offsetX - geometry.safetyLeft);
		let minIndex = getClosestTickIndex(binsTicks, value);

		/* snap and limit left handle value */

		const maxIndex = getClosestTickIndex(binsTicks, max);
		if (minIndex >= maxIndex) {
			minIndex = Math.max(0, maxIndex - 1);
		}
		min = binsTicks[minIndex];
	}

	const handleMaxDrag = event => {
		const value = xScale.invert(event.offsetX - geometry.safetyLeft);
		let maxIndex = getClosestTickIndex(binsTicks, value);

		/* snap and limit right handle value */
		const minIndex = getClosestTickIndex(binsTicks, min);
		if (maxIndex <= minIndex) {
			maxIndex = Math.min(minIndex + 1, binsTicks.length - 1);
		}
		max = binsTicks[maxIndex];
	}

	const createStartDragging = ({isMinKnob}) => event => {
		event.target.onpointermove = isMinKnob ? handleMinDrag : handleMaxDrag;
		event.target.setPointerCapture(event.pointerId);
	}

	const stopDragging = event => {
		event.target.onpointermove = null;
		event.target.releasePointerCapture(event.pointerId);

		const {filters: oldFilters} = $_selection;
		const newFilters = {
			...oldFilters,
			installation_date: {
				gte: min.getTime(),
				lte: max.getTime()
			}
		}

		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {filters: newFilters}
		});
	}

	let bbox;
	let bins;
	let binsTicks;
	let binWidth;
	let items;
	let Max;
	let max;
	let maxX;
	let Min;
	let min;
	let minX;
	let proceed = false;
	let xScale;
	let xTicks;
	let yScale;

	$: ({inlineSize: width, blockSize: height} = $_size);

	$: if ($_installationDateExtent) {
		items = $_staticData.timelines[$_selection.interval];
		Max = $_installationDateExtent.Max;
		Min = $_installationDateExtent.Min;
	}

	$: selectedRange = $_selection.filters.installation_date
	$: max = selectedRange?.lte || Max;
	$: min = selectedRange?.gte || Min;

	$: if (items && $_size && $_installationDateExtent) {

		/* geometry */

		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			height: height - geometry.safetyTop - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
		};

		/* scales, ticks */

		xScale = scaleUtc().domain([Min, Max]).range([0, bbox.width]);
		binWidth = xScale(getKey(items[1])) - xScale(getKey(items[0]));
		binsTicks = xScale.ticks(items.length + 1);

		const [, dMax] = extent(items, getDocCount);
		yScale = scaleLinear().domain([0, dMax]).range([0, bbox.height]);

		/* x axis */

		xTicks = _.map(xScale.ticks(), date => ({
			dy: -geometry.safetyTop / 4,
			label: formatDate(date),
			x: xScale(date),
		}));

		/* snap handles when data changes */

		let minIndex = getClosestTickIndex(binsTicks, min);
		let maxIndex = getClosestTickIndex(binsTicks, max);

		if (maxIndex <= minIndex) {
			maxIndex = Math.min(minIndex + 1, binsTicks.length - 1);
		}
		if (minIndex >= maxIndex) {
			minIndex = Math.max(0, maxIndex - 1);
		}

		min = binsTicks[minIndex];
		max = binsTicks[maxIndex];

		proceed = true;
	}

	$: if (proceed) {

		/* interaction */

		minX = xScale(min);
		maxX = xScale(max);

		/* bins */

		bins = _.map(items, ({key, doc_count}) => {
			const binHeight = yScale(doc_count);
			const x = xScale(key);

			return {
				height: binHeight,
				selected: x >= minX && x < maxX,
				width: binWidth,
				x,
				y: bbox.height - binHeight,
			}
		});

		sensors.dynamicWidth = Math.min(sensors.maxSemiWidth, (maxX - minX) / 2);
		sensors.width = sensors.maxSemiWidth + sensors.dynamicWidth;
		sensors.xMin = minX - sensors.maxSemiWidth;
		sensors.xMax = maxX - sensors.dynamicWidth;
	}
</script>

<div
	class='TimeLine'
	style='font-size:{fontSize}; --knobStrokeWidth:{knobStrokeWidth}px;'
	use:sizeObserver={'contentBoxSize'}
>
	{#if proceed}
		<svg
			{height}
			{width}
		>
			<g transform='translate({bbox.blx},{bbox.try})'>

				<!-- x axis -->

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

				<!-- bins -->

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

				<!-- min handle -->

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
					cy={bbox.height / 2}
					r={knobRadius}
				/>

				<!-- max handle -->

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
					cy={bbox.height / 2}
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
