<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {setupResizeObserver} from '@svizzle/ui';
	import {scaleLinear} from 'd3-scale';
	import {createEventDispatcher} from 'svelte';

	export let formatFn;
	export let max;
	export let Max;
	export let min;
	export let Min;
	export let theme;

	const dispatch = createEventDispatcher();

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const defaultTheme = {
		knobFill: 'white',
		knobStroke: 'black',
		knobStrokeWidth: 1,
		lineColor: 'gray',
		textColor: 'black'
	}

	let height;
	let isDraggingMin = false;
	let width;

	$: ({blockSize: height, inlineSize: width} = $_size);

	$: Min = Min ?? 0;
	$: Max = Max ?? 100;
	$: min = min || Min;
	$: max = max || Max;
	$: max < min && (max = min);

	$: theme = {...defaultTheme, ...theme};
	$: knobRadius = height / 2 - theme.knobStrokeWidth / 2;
	$: geometry = {x1: theme.knobStrokeWidth / 2 + knobRadius};
	$: geometry.x2 = width - geometry.x1;
	$: style = makeStyleVars({...theme, x1: `${geometry.x1}px`});

	$: scale = scaleLinear().domain([Min, Max]).range([geometry.x1, geometry.x2]);

	const handleMinDrag = event => {
		const value = Math.min(
			Math.max(geometry.x1, event.offsetX),
			scale(max)
		);
		min = scale.invert(value);
	}
	const handleMaxDrag = event => {
		const value = Math.max(
			Math.min(geometry.x2, event.offsetX),
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
</script>

<div
	{style}
	class='RangeSlider'
>
	<div class='output'>
		{formatFn?.(min) || min} - {formatFn?.(max) || max}
	</div>
	<div
		class='slider'
		use:sizeObserver
	>
		<svg {height} {width}>
			<line
				x1={geometry.x1}
				x2={geometry.x2}
				y1={geometry.x1}
				y2={geometry.x1}
			/>
			<circle
				class='knob min'
				cx={scale(min)}
				cy={geometry.x1}
				on:pointerdown={createStartDragging({isMinKnob: true})}
				on:pointerup={stopDragging}
				r={knobRadius}
			/>
			<circle
				class='knob max'
				cx={scale(max)}
				cy={geometry.x1}
				on:pointerdown={createStartDragging({isMinKnob: false})}
				on:pointerup={stopDragging}
				r={knobRadius}
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
		height: 1.1em;
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
</style>
