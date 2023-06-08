<script>
	import Bullet from '$lib/components/explorer/Bullet.svelte';

	export let categories;
	export let labelsByCategory;
	export let minCellWidth = '15%';

	$: minCellWidth = minCellWidth ?? '15%';
	$: style = `--minCellWidth:${minCellWidth}`;
</script>

<div
	{style}
	class='LabelsGrid'
>
	{#each categories as category}
		<div class='cell'>
			<Bullet
				backgroundColor={'var(--colorAux)'}
				color={'var(--colorAuxText)'}
				text={labelsByCategory[category]}
			/>
			{category}
		</div>
	{/each}
</div>

<style>
	.LabelsGrid  {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(var(--minCellWidth), 1fr));
		gap: 0.5em;
	}
	.cell {
		align-items: start;
		display: flex;
		gap: 0.75em;
		height: 100%;
		justify-content: flex-start;
		width: 100%;
	}
</style>
