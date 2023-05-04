<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let percents = [50, 50];

	$: style = makeStyleVars({
		p0: `${percents[0]}%`,
		p1: `${percents[1]}%`,
	});
</script>

<div class='GridRows' {style}>
	<slot></slot>
</div>

<style>
	.GridRows {
		display: grid;
		grid-template-rows: var(--p0) var(--p1);
		height: 100%;
		width: 100%;
	}
</style>
