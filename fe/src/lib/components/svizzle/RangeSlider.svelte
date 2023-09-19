<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {setupResizeObserver} from '@svizzle/ui';
	import {getKey} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleLinear} from 'd3-scale';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import {getDocCount} from '$lib/utils/getters.js';

	export let formatFn;
	export let items;
	export let max;
	export let Max;
	export let min;
	export let Min;
	export let theme;
	export let geometry;

	const dispatch = createEventDispatcher();

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const defaultTheme = {
		knobFill: 'white',
		knobStroke: 'black',
		knobStrokeWidth: 1.5,
		lineColor: 'gray',
		textColor: 'black',
	}

	const defaultGeometry = {
		histogramHeight: 40,
		knobRadius: 5,
		safetyBottom: 8,
		safetyLeft: 0,
		safetyRight: 0,
		safetyTop: 8,
	}

	let bbox;
	let bins;
	let binsTicks;
	let binWidth;
	let isDraggingMin = false;
	let layout;
	let maxX;
	let minX;
	let proceed;
	let style;
	let width;
	let xScale;
	let yScale;

	$: ({inlineSize: width} = $_size);

	$: Min = Min ?? 0;
	$: Max = Max ?? 100;
	$: min = min || Min;
	$: max = max || Max;
	$: max < min && (max = min);

	$: theme = {...defaultTheme, ...theme};
	$: geometry = geometry ? {...defaultGeometry, ...geometry} : defaultGeometry;

	$: knobRadius = geometry.knobRadius + theme.knobStrokeWidth;
	$: knobOffset = knobRadius + theme.knobStrokeWidth / 2;

	// FIXME duplicate of xScale?
	$: scale = scaleLinear().domain([Min, Max]).range([layout.x1, layout.x2]);

	const handleMinDrag = event => {
		const value = Math.min(
			Math.max(layout.x1, event.offsetX),
			scale(max)
		);
		min = scale.invert(value);
	}
	const handleMaxDrag = event => {
		const value = Math.max(
			Math.min(layout.x2, event.offsetX),
			scale(min)
		);
		max = scale.invert(value);
	}

	const createStartDragging = ({isMinKnob}) => event => {
		isDraggingMin = isMinKnob;
		event.target.onpointermove = isMinKnob ? handleMinDrag : handleMaxDrag;
		event.target.setPointerCapture(event.pointerId);
	}
	const stopDragging = event => {
		event.target.onpointermove = null;
		event.target.releasePointerCapture(event.pointerId);

		dispatch('changed', {min, max});
	}

	$: if (items && $_size) {

		// FIXME refactor bbox & layout

		/* layout */

		bbox = {
			// blx: geometry.safetyLeft,
			// bly: geometry.histogramHeight + geometry.safetyTop,
			height: geometry.histogramHeight,
			// trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width + geometry.safetyLeft - geometry.safetyRight - knobRadius * 2,
		};
		layout = {
			x1: geometry.safetyLeft + knobOffset,
			x2: width - geometry.safetyRight - knobOffset,
			sliderY: geometry.histogramHeight + geometry.safetyTop,
			height: geometry.histogramHeight + geometry.safetyBottom + geometry.safetyTop
		};
		style = makeStyleVars({
			...theme,
			height: `${layout.height}px`,
			x1: `${layout.x1}px`,
		});

		/* scales, ticks */

		xScale =
			scaleLinear()
			.domain([Min, Max])
			.range([geometry.safetyLeft + knobRadius, bbox.width]);
		binWidth = xScale(getKey(items[1])) - xScale(getKey(items[0]));
		binsTicks = xScale.ticks(items.length + 1);

		const [, dMax] = extent(items, getDocCount);
		yScale = scaleLinear().domain([0, dMax]).range([0, bbox.height]);

		proceed = true;
	}

	$: if (proceed) {
		bins = _.map(items, ({key, doc_count}) => {
			const binHeight = yScale(doc_count);
			const x = xScale(key);

			return {
				height: binHeight,
				selected: x >= minX && x < maxX,
				width: Math.max(0, binWidth),
				x,
				y: bbox.height - binHeight + geometry.safetyTop,
			}
		});
	}
</script>

<div
	{style}
	class='RangeSlider'
	on:touchstart|preventDefault={null}
>
	<div class='output'>
		{formatFn?.(min) || min} - {formatFn?.(max) || max}
	</div>
	<div
		class='slider'
		use:sizeObserver
	>
		<svg height={geometry.height} {width}>

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

			<!-- slider -->

			<line
				x1={layout.x1}
				x2={layout.x2}
				y1={layout.sliderY}
				y2={layout.sliderY}
			/>
			<circle
				class='knob min'
				cx={scale(min)}
				cy={layout.sliderY}
				on:pointerdown={createStartDragging({isMinKnob: true})}
				on:pointerup={stopDragging}
				r={knobRadius}
				stroke-width={theme.knobStrokeWidth}
			/>
			<circle
				class='knob max'
				cx={scale(max)}
				cy={layout.sliderY}
				on:pointerdown={createStartDragging({isMinKnob: false})}
				on:pointerup={stopDragging}
				r={knobRadius}
				stroke-width={theme.knobStrokeWidth}
			/>
		</svg>
	</div>
	<div class='extent'>
		<div>{formatFn?.(Min) || Min}</div>
		<div>{formatFn?.(Max) || Max}</div>
	</div>
</div>

<style>
	.RangeSlider {
		width: 100%;
	}

	.output {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.slider {
		user-select: none;
		height: var(--height);
		width: 100%;
	}
	text {
		fill: var(--textColor);
	}
	line {
		stroke-width: 1;
		stroke: var(--lineColor);
	}
	.knob {
		cursor: pointer;
		fill: var(--knobFill);
		stroke-width: var(--knobStrokeWidth);
		stroke: var(--knobStroke);
	}

	.extent {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 var(--x1)
	}

	.bins rect {
		fill: var(--colorTimelineInactiveBinFill);
		stroke: var(--colorTimelineInactiveBinStroke);
	}
	.bins rect.selected {
		fill: var(--colorTimelineActiveBinFill);
		stroke: var(--colorTimelineActiveBinStroke);
	}

</style>
