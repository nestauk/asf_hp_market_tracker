<script>
	import Bullet from '$lib/components/explorer/Bullet.svelte';

	export let categories;
	export let extraWidth;
	export let labelsByCategory;
</script>

<div
	class='ColumnNames'
	style='padding-right: {extraWidth}px'
>
	{#each categories as category}
		<Bullet
			backgroundColor={'var(--colorAux)'}
			color={'var(--colorAuxText)'}
			text={labelsByCategory[category]}
		/>
	{/each}
</div>


<style>
	.ColumnNames {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		justify-content: stretch;
		justify-items: center;
		padding: 0.25em;
	}
</style>
