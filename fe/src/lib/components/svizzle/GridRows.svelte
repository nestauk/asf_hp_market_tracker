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
		padding,
		rowLayout,
	});
</script>

<div
	{style}
	class='GridRows'
>
	<slot />
</div>

<style>
	.GridRows {
		align-items: center;
		display: grid;
		gap: var(--gap);
		grid-template-columns: 100%;
		grid-template-rows: var(--rowLayout);
		height: 100%;
		justify-items: center;
		overflow: hidden;
		padding: var(--padding);
		width: 100%;
	}
</style>
