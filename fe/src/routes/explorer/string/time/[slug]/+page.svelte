<script>
	import DevView from '$lib/components/explorer/DevView.svelte';
	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
</script>

<Grid2Rows dimensions={['10%', '90%']}>
	<TemporalOptions />
	<DevView/>
</Grid2Rows>
