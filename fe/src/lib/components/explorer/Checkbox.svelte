<script>
	import {CheckSquare, Icon, Square} from '@svizzle/ui';

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
		cursor: pointer;
		display: flex;
		gap: 0.5em;
	}
</style>
