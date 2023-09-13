<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let gap;
	export let padding;
	export let colLayout;

	$: gap = gap || '0.25em';
	$: padding = padding || '0.5em';
	$: colLayout = colLayout || '1fr';
	$: style = makeStyleVars({
		colLayout,
		gap,
		padding,
	});
</script>

<div
	{style}
	class='GridColumns'
>
	<slot />
</div>

<style>
	.GridColumns {
		align-items: center;
		display: grid;
		gap: var(--gap);
		grid-template-columns: var(--colLayout);
		height: 100%;
		justify-items: center;
		overflow: hidden;
		padding: var(--padding);
		width: 100%;
	}
</style>
