<script>
	import {CheckSquare, Icon, Square} from '@svizzle/ui';

	export let checked;
	export let label;
</script>

<div
	class='Checkboxed'
	on:click
>
	<Icon
		glyph={checked ? CheckSquare : Square}
		size=16
	/>
	<slot>
		<span>{label}</span>
	</slot>
</div>

<style>
	.Checkboxed {
		align-items: center;
		cursor: pointer;
		display: grid;
		gap: 0.5em;
		grid-template-columns: min-content 1fr;
		user-select: none;
		width: 100%;
	}
</style>
