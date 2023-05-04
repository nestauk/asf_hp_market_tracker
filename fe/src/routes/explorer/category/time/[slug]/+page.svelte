<script>
	import DevView from '$lib/components/explorer/DevView.svelte';
	import IntervalSelector
		from '$lib/components/explorer/medium/IntervalSelector.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
</script>

<Grid2Rows percents={[10, 90]}>
	<IntervalSelector />
	<DevView/>
</Grid2Rows>
