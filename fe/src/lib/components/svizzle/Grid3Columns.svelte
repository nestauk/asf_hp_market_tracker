<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let dimensions = ['33%', '33%', '34%'];
	export let gap;

	$: gap = gap ?? 0
	$: style = makeStyleVars({
		d0: dimensions[0],
		d1: dimensions[1],
		d2: dimensions[2],
		gap,
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
			calc(var(--d0) - var(--gap) / 3)
			calc(var(--d1) - var(--gap) / 3)
			calc(var(--d2) - var(--gap) / 3);
		height: 100%;
		width: 100%;
	}
	.col {
		height: 100%;
		overflow-y: auto;
		width: 100%;
	}
</style>
