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
		stroke={checked ? 'var(--colorBackgroundApply)' : null}
	/>
	<slot>
		<span>{label}</span>
	</slot>
</div>

<style>
	.Checkbox {
		align-items: center;
		cursor: pointer;
		display: grid;
		grid-template-columns: min-content 1fr;
		gap: 0.5em;
		width: 100%;
	}
</style>
