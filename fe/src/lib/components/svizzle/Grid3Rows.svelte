<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let gap = 0;
	export let dimensions = ['33%', '33%', '34%'];

	$: style = makeStyleVars({
		p0: dimensions[0],
		p1: dimensions[1],
		p2: dimensions[2],
	});
</script>

<div class='Grid3Rows' {style}>
	<slot />
</div>

<style>
	.Grid3Rows {
		display: grid;
		grid-template-rows:
			calc(var(--p0) - var(--gap) / 3)
			calc(var(--p1) - var(--gap) / 3)
			calc(var(--p2) - var(--gap) / 3);
		height: 100%;
		width: 100%;
	}
</style>
