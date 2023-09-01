<script>
	export let rowLayout;

	$:rowLayout = rowLayout || '1fr';
</script>

<div class='GridRows' style='grid-template-rows: {rowLayout};'>
	<slot />
</div>

<style>
	div {
		display: grid;
		justify-items: center;
		height: 100%;
		overflow: hidden;
		width: 100%;
	}
</style>
