<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let gap = 0;
	export let dimensions = ['50%', '50%'];

	$: style = makeStyleVars({
		p0: dimensions[0],
		p1: dimensions[1],
	});
</script>

<div class='Grid2Rows' {style}>
	<slot />
</div>

<style>
	.Grid2Rows {
		display: grid;
		grid-template-rows: calc(var(--p0) - var(--gap) / 2) calc(var(--p1) - var(--gap) / 2);
		height: 100%;
		width: 100%;
	}
</style>
