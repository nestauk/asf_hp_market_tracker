<script>
	import {CheckSquare, Icon, Square} from '@svizzle/ui';

	export let checked;
	export let label;
</script>

<div
	class='Checkboxed'
	on:click
	on:keydown
	role='button'
	tabindex='0'
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

	.Checkboxed:focus-visible {
		outline: var(--outline);
		outline-offset: calc(-1 * var(--outlineWidth));
	}
</style>
