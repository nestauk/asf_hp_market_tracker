<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let gap;
	export let percents = [50, 50];

	$: style = makeStyleVars({
		gap,
		p0: `${percents[0]}%`,
		p1: `${percents[1]}%`,
	});
</script>

<div class='Grid2Columns' {style}>
	<div class='col'>
		<slot name='col0'>Missing column 0</slot>
	</div>
	<div class='col'>
		<slot name='col1'>Missing column 1</slot>
	</div>
</div>

<style>
	.Grid2Columns {
		display: grid;
		gap: var(--gap);
		grid-template-columns: var(--p0) var(--p1);
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
	.col {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		overflow-y: auto;
		width: 100%;
	}
</style>
