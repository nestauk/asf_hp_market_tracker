<script>
	import {makeStyle, makeStyleVars, toPx} from '@svizzle/dom';

	export let targetX;
	export let targetY;
	export let theme;

	const geometry = {
		safetyLeft: 16,
		safetyRight: 4,
		safetyTop: 16,
		safetyBottom: 4,
	};

	const defaultheme = {
		backgroundColor: 'white',
		border: 'thin solid black',
		boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.5)',
		textColor: 'black',
		padding: '0.5em',
	}

	let tooltip;
	let tooltipStyle = {};

	$: theme = {
		...defaultheme,
		...theme
	}
	$: if (tooltip) {
		const parent = tooltip.parentElement;
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
			[y.key]: toPx(y.value)
		};
	}

	$: style = `${makeStyleVars(theme)};${makeStyle(tooltipStyle)}`;
</script>

<div
	class='Tooltip'
	{style}
	bind:this={tooltip}
>
	<slot />
</div>

<style>
	.Tooltip {
		position: absolute;
		pointer-events: none;
		background: var(--backgroundColor);
		border: var(--border);
		box-shadow: var(--boxShadow);
		color: var(--textColor);
		padding: var(--padding);
	}
</style>
