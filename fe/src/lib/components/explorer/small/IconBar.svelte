<script>
	import {Icon} from '@svizzle/ui';
	import {createEventDispatcher} from 'svelte';

	import {_getIconColor} from '$lib/stores/theme';

	const dispatch = createEventDispatcher();

	export let activeIconId;
	export let icons;

	const onSelect = id => {
		dispatch('selected', id);
	}

	const makeOnKeyDown = viewId => event => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			onSelect(viewId);
		}
	}

	$: icons = icons || [];
	$: style = `--count:${icons.length};`;
</script>

<nav
	{style}
	class='IconBar'
>
	{#each icons as {glyph, id, transform}}
		<div
			class:active={activeIconId === id}
			class='button clickable'
			on:click={onSelect(id)}
			on:keydown={makeOnKeyDown(id)}
		>
			<div style='transform: {transform}'>
				<Icon
					glyph={glyph}
					stroke={$_getIconColor(id, activeIconId)}
				/>
			</div>
		</div>
	{/each}
</nav>

<style>
	.IconBar {
		background-color: var(--colorBackground);
		border-top: var(--border);
		display: grid;
		grid-template-columns: repeat(var(--count), 1fr);
		grid-template-rows: 100%;
		height: 100%;
		width: 100%;
	}

	.active {
		background: var(--colorSelectedBackground);
		color: var(--colorSelectedText);
	}

	.button {
		align-items: center;
		align-self: stretch;
		display: grid;
		justify-items: center;
		justify-self: stretch;
		padding: .5em 0;
	}

	.clickable {
		cursor: pointer;
	}
</style>
