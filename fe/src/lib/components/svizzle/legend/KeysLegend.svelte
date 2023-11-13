<script>
	export let keyToColorFn;
	export let keys;
</script>

<div class='KeysLegend'>
	<ul>
		{#each keys as key}
			<li class:noColor={!keyToColorFn}>
				{#if keyToColorFn}
					<span
						class='dot'
						style='background-color: {keyToColorFn(key)}'
					/>
				{/if}
				<span class='key'>{key}</span>
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
	li.noColor {
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
</style>
