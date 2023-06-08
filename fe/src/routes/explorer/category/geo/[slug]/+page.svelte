<script>
	import DevView from '$lib/components/explorer/DevView.svelte';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectorRegionType
		from '$lib/components/explorer/medium/SelectorRegionType.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
</script>

<Grid2Rows percents={[10, 90]}>
	<FlexBar>
		<SelectorRegionType />
	</FlexBar>
	<DevView/>
</Grid2Rows>
