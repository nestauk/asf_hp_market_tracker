<script>
	import {makeStyle, makeStyleVars, toPx} from '@svizzle/dom';
	import {createEventDispatcher} from 'svelte';

	export let geometry;
	export let isTouchDevice;
	export let targetX;
	export let targetY;
	export let theme;
	export let useBackdrop;

	const dispatch = createEventDispatcher();

	const defaultGeometry = {
		safetyBottom: 4,
		safetyLeft: 16,
		safetyRight: 4,
		safetyTop: 16,
	};

	const defaultTheme = {
		backgroundColor: 'white',
		border: 'thin solid black',
		boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.5)',
		padding: '0.25em 0.5em',
		textColor: 'black',
		zIndex: 3000,
		zIndexBackdrop: 2000,
	}

	const onClick = () => dispatch('closed');

	let tooltipNode;
	let tooltipStyle = {};

	$: geometry = geometry ? {...defaultGeometry, ...geometry} : defaultGeometry;
	$: useBackdrop = useBackdrop || false;
	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: if (tooltipNode) {
		const parent = tooltipNode.parentElement;
		const parentRect = parent.getBoundingClientRect();
		const parentWidth = parentRect.width;
		const parentHeight = parentRect.height;

		const x = targetX < parentWidth / 2
			? {key: 'left', value: targetX + geometry.safetyLeft}
			: {key: 'right', value: parentWidth - targetX + geometry.safetyRight};
		const y = !isTouchDevice
			? targetY < parentHeight / 2
				? {key: 'top', value: targetY + geometry.safetyTop}
				: {key: 'bottom', value: parentHeight - targetY + geometry.safetyBottom}
			: {key: 'bottom', value: parentHeight - targetY + geometry.safetyBottom};

		tooltipStyle = {
			[x.key]: toPx(x.value),
			[y.key]: toPx(y.value),
		};
	}

	$: styleVars = makeStyleVars(theme);
	$: style = makeStyle(tooltipStyle);
</script>

{#if useBackdrop}
	<div
		class='TooltipBackdrop'
		on:touchstart|preventDefault|stopPropagation={onClick}
		style={styleVars}
	>
		<div
			{style}
			bind:this={tooltipNode}
			class:usingBackdrop={useBackdrop}
			class='Tooltip'
		>
			<slot />
		</div>
	</div>
{:else}
	<div
		bind:this={tooltipNode}
		class='Tooltip'
		style='{styleVars};{style};'
	>
		<slot />
	</div>
{/if}

<style>
	.Tooltip {
		background: var(--backgroundColor);
		border: var(--border);
		box-shadow: var(--boxShadow);
		color: var(--textColor);
		padding: var(--padding);
		pointer-events: none;
		position: absolute;
		z-index: var(--zIndex);
	}
	.Tooltip.usingBackdrop {
		pointer-events: auto;
	}
	.TooltipBackdrop {
		align-content: center;
		background: rgba(0, 0, 0, 0.25);
		display: grid;
		height: 100%;
		justify-content: center;
		left: 0;
		position: absolute;
		top: 0;
		width: 100%;
		z-index: var(--zIndexBackdrop);
	}
</style>
