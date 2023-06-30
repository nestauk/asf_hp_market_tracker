<script>
	import {setupResizeObserver} from '@svizzle/ui';
	import {getKey} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleLinear, scaleTime} from 'd3-scale';
	import * as _ from 'lamb';

	import {_staticData} from '$lib/stores/data.js';
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
	const knobRadius = 8;

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
		const [[, smallest]] = ticks
		.map((tick, i) => [Math.abs(tick.getTime() - value.getTime()), i])
		.sort(([a], [b]) => a - b);
		return ticks[smallest];
	}

	const handleMinDrag = event => {
		const value = Math.min(
			Math.max(knobGeometry.x1, event.offsetX - geometry.safetyLeft),
			xScale(max)
		);
		min = xScale.invert(value);
		const closestTick = getClosestTick(selectionTicks, min);
		cursorX = xScale(closestTick);
	}
	const handleMaxDrag = event => {
		const value = Math.max(
			Math.min(knobGeometry.x2, event.offsetX - geometry.safetyLeft),
			xScale(min)
		);
		max = xScale.invert(value);
		const closestTick = getClosestTick(selectionTicks, max);
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
		if (isMinDragging) {
			min = xScale.invert(cursorX);
		} else {
			max = xScale.invert(cursorX);
		}
		cursorX = null;
		// dispatch('changed', {min, max});
	}

	let bbox;
	let cursorX;
	let fontSize;
	let items;
	let rects;
	let xTicks;
	let knobGeometry;
	let Min;
	let Max;
	let selectionTicks;
	let xScale;
	let isMinDragging;

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
			scaleTime()
			.domain(timeDomain)
			.range([0, bbox.width]);

		const barWidth = xScale(getKey(items[1])) - xScale(getKey(items[0]));

		const [, dMax] = extent(items, getDocCount);
		const yScale = scaleLinear().domain([0, dMax]).range([0, bbox.height]);

		selectionTicks = xScale.ticks(items.length + 1);
		[Min, Max] = timeDomain;
		!min && (min = Min);
		!max && (max = Max);

		rects = _.map(items, ({key, doc_count}) => {
			const barHeight = yScale(doc_count);

			return {
				height: barHeight,
				width: barWidth,
				x: xScale(key),
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
							y1={0}
							y2={bbox.height}
						/>
					{/each}
				</g>

				<g class='bins'>
					{#each rects as {x, y, width, height}}
						<rect
							{height}
							{width}
							{x}
							{y}
						/>
					{/each}
				</g>

				{#if cursorX}
					<line
						class='cursor'
						x1={cursorX}
						x2={cursorX}
						y1={0}
						y2={bbox.height}
						stroke='red'
					/>
				{/if}

				<circle
					class='knob min'
					cx={xScale(min)}
					cy={knobGeometry.x1}
					on:pointerdown={createStartDragging({isMinKnob: true})}
					on:pointerup={stopDragging}
					r={knobRadius}
				/>

				<circle
					class='knob max'
					cx={xScale(max)}
					cy={knobGeometry.x1}
					on:pointerdown={createStartDragging({isMinKnob: false})}
					on:pointerup={stopDragging}
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
		fill: var(--colorTimelineActiveBinFill);
		stroke: var(--colorTimelineActiveBinStroke);
	}
	.knob {
		cursor: pointer;
		fill: var(--colorSwitchKnob);
		stroke-width: var(--knobStrokeWidth);
		stroke: var(--colorBorderAux);
	}
</style>
