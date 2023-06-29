<script>
	import {Icon, CheckSquare, Square} from '@svizzle/ui';

	export let checked;
	export let label;

</script>

<div
	class='Checkbox'
	on:click
>
	<Icon
		glyph={checked ? CheckSquare : Square}
		size=16
	/>
	<span>{label}</span>
</div>

<style>
	.Checkbox {
		align-items: center;
		display: flex;
		gap: 0.5em;
	}
</style>
