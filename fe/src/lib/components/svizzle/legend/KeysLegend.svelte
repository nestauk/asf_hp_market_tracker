<script>
    import { makeStyleVars } from '@svizzle/dom';
	import {createEventDispatcher} from 'svelte';

	import ScrollIntoView from '$lib/components/svizzle/ui/ScrollIntoView.svelte';

	export let heroKey;
	export let keyToColorFn;
	export let keys;
	export let theme;

	const defaultTheme = {
		heroBackgroundColor: 'black',
		heroTextColor: 'white',
	};

	const dispatch = createEventDispatcher();

	const onMouseMove = key => {
		dispatch('keyHovered', key);
	}

	const onMouseLeave = key => {
		dispatch('keyExited', key);
	}

	$: style = makeStyleVars({
		...defaultTheme,
		...theme,
	});
</script>

<div
	{style}
	class='KeysLegend'
>
	<ul class:noDots={!keyToColorFn}>
		{#each keys as key}
			<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
			<li
				class:hero={key === heroKey}
				on:mousemove={() => onMouseMove(key)}
				on:mouseleave={() => onMouseLeave(key)}
				tabindex='0'
			>
				{#if keyToColorFn}
					<span
						class='dot'
						style='background-color: {keyToColorFn(key)}'
					/>
				{/if}
				<ScrollIntoView doIt={key === heroKey} alignToTop>
					<span class='key'>{key}</span>
				</ScrollIntoView>
			</li>
		{/each}
	</ul>
</div>

<style>
	.KeysLegend {
		align-items: center;
		display: grid;
		height: 100%;
		padding: 0;
		width: 100%;
	}
	li {
		align-items: center;
		display: grid;
		grid-gap: 0.5em;
		grid-template-columns: min-content 1fr;
		justify-items: start;
		padding: 0.25em;
	}
	ul.noDots li {
		grid-template-columns: 1fr;
	}
	.dot {
		border-radius: 50%;
		display: inline-block;
		min-height: 1em;
		min-width: 1em;
	}
	.key {
		word-break: break-word;
	}
	.hero {
		background: var(--heroBackgroundColor);
		color: var(--heroTextColor);
	}
</style>
