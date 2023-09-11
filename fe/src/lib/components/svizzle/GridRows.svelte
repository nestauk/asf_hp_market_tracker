<script>
	import {makeStyleVars} from '@svizzle/dom';
	export let gap;
	export let padding;
	export let rowLayout;

	$: gap = gap || '0.25em';
	$: padding = padding || '0.5em';
	$: rowLayout = rowLayout || '1fr';
	$: style = makeStyleVars({
		gap,
		rowLayout,
		padding
	});
</script>

<div class='GridRows' {style}>
	<slot />
</div>

<style>
	div {
		display: grid;
		gap: var(--gap);
		grid-template-rows: var(--rowLayout);
		height: 100%;
		justify-items: center;
		overflow: hidden;
		padding: var(--padding);
		width: 100%;
	}
</style>
