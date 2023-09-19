<script>
	export let targetX;
	export let targetY;
	export let targetWidth;
	export let targetHeight;

	let tooltip;
	let tooltipX;
	let tooltipY;

	$: if (tooltip) {
		const parent = tooltip.parentElement;
		const parentRect = parent.getBoundingClientRect();
		const parentWidth = parentRect.width;
		const parentHeight = parentRect.height;


		const tooltipWidth = tooltip?.offsetWidth;
		const tooltipHeight = tooltip?.offsetHeight;
	
		tooltipX = targetX + targetWidth + tooltipWidth < parentWidth
			? targetX + targetWidth
			: targetX - tooltipWidth;
		tooltipY = targetY + targetHeight + tooltipHeight > parentHeight
			? targetY - tooltipHeight
			: targetY + targetHeight;
	}
</script>

<div
	class='Tooltip'
	style='left: {tooltipX}px; top: {tooltipY}px;'
	bind:this={tooltip}
>
	<slot />
</div>

<style>
	.Tooltip {
		position: absolute;
		pointer-events: none;
		background: white;
		border: thin solid black;
		box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
		color: black;
		padding: 0.5em;
		z-index: 1000;
		/* width: max(min-content, 10em); */
	}
</style>
