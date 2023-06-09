<script>
	import MetricSelector from '$lib/components/explorer/MetricSelector.svelte';
	import ViewMedium from '$lib/components/explorer/medium/ViewMedium.svelte';
	import TimeLineHistogram from '$lib/components/explorer/medium/TimeLineHistogram.svelte';
</script>

<div class='ExplorerMedium'>
	<nav class='filters'>filters</nav>
	<nav class='metrics'>
		<MetricSelector />
	</nav>
	<nav class='timeline'>
		<TimeLineHistogram />
	</nav>
	<section class='view'>
		<ViewMedium>
			<slot />
		</ViewMedium>
	</section>
</div>

<style>
	.ExplorerMedium {
		display: grid;
		grid-template-areas:
			"filters view metrics"
			"filters timeline timeline";
		grid-template-columns: 15% 70% 15%;
		grid-template-rows: 90% 10%;
		height: 100%;
		width: 100%;
	}
	.ExplorerMedium > div {
		max-height: 100%;
		overflow: hidden;
		position: relative;
	}

	.filters {
		align-items: center;
		border-right: thin solid var(--colorBorder);
		display: flex;
		grid-area: filters;
		justify-content: center;
	}
	.metrics {
		grid-area: metrics;
		border-left: thin solid var(--colorBorder);
	}
	.timeline {
		align-items: stretch;
		border-top: thin solid var(--colorBorder);
		display: flex;
		grid-area: timeline;
		justify-content: stretch;
	}
	.view {
		grid-area: view;
	}
</style>
