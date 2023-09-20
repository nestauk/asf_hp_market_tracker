<script>
	import {makeStyle, makeStyleVars, toPx} from '@svizzle/dom';

	export let targetX;
	export let targetY;
	export let theme;

	const geometry = {
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
		zIndex: 1000,
	}

	let tooltipNode;
	let tooltipStyle = {};

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: if (tooltipNode) {
		const parent = tooltipNode.parentElement;
		const parentRect = parent.getBoundingClientRect();
		const parentWidth = parentRect.width;
		const parentHeight = parentRect.height;

		const x = targetX < parentWidth / 2
			? {key: 'left', value: targetX + geometry.safetyLeft}
			: {key: 'right', value: parentWidth - targetX + geometry.safetyRight};
		const y = targetY < parentHeight / 2
			? {key: 'top', value: targetY + geometry.safetyTop}
			: {key: 'bottom', value: parentHeight - targetY + geometry.safetyBottom};

		tooltipStyle = {
			[x.key]: toPx(x.value),
			[y.key]: toPx(y.value),
		};
	}

	$: style = `${makeStyleVars(theme)};${makeStyle(tooltipStyle)};`;
</script>

<div
	{style}
	bind:this={tooltipNode}
	class='Tooltip'
>
	<slot />
</div>

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
</style>
