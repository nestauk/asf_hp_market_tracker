<script>
	import DevView from '$lib/components/explorer/DevView.svelte';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectorInterval from '$lib/components/explorer/medium/SelectorInterval.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
</script>

<Grid2Rows percents={[10, 90]}>
	<FlexBar>
		<SelectorInterval/>
	</FlexBar>
	<DevView/>
</Grid2Rows>
