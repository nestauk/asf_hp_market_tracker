<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let gap = 0;
	export let percents = [20, 40, 40];

	$: style = makeStyleVars({
		gap,
		p0: `${percents[0]}%`,
		p1: `${percents[1]}%`,
		p2: `${percents[2]}%`,
	});
</script>

<div class='Grid3Columns' {style}>
	<div class='col'>
		<slot name='col0'>Missing column 0</slot>
	</div>
	<div class='col'>
		<slot name='col1'>Missing column 1</slot>
	</div>
	<div class='col'>
		<slot name='col2'>Missing column 2</slot>
	</div>
</div>

<style>
	.Grid3Columns {
		display: grid;
		gap: var(--gap);
		grid-template-columns:
			calc(var(--p0) - var(--gap) / 3)
			calc(var(--p1) - var(--gap) / 3)
			calc(var(--p2) - var(--gap) / 3);
		height: 100%;
		width: 100%;
	}
	.col {
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
</style>
