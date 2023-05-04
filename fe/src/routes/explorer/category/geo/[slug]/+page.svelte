<script>
	import DevView from '$lib/components/explorer/DevView.svelte';
	import RegionLevelSelector
		from '$lib/components/explorer/medium/RegionTypeSelector.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
</script>

<Grid2Rows percents={[10, 90]}>
	<RegionLevelSelector />
	<DevView/>
</Grid2Rows>
