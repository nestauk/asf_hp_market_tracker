<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let dimensions = ['33%', '33%', '34%'];
	export let gap;

	$: gap = gap ?? 0;
	$: style = makeStyleVars({
		d0: dimensions[0],
		d1: dimensions[1],
		d2: dimensions[2],
		gap,
	});
</script>

<div class='Grid3Rows' {style}>
	<slot />
</div>

<style>
	.Grid3Rows {
		display: grid;
		gap: var(--gap);
		grid-template-rows:
			calc(var(--d0) - var(--gap) / 3)
			calc(var(--d1) - var(--gap) / 3)
			calc(var(--d2) - var(--gap) / 3);
		height: 100%;
		width: 100%;
	}
</style>
