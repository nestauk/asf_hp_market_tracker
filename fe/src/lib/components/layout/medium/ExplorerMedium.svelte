<script>
	import * as _ from 'lamb';

	import FiltersBar from '$lib/components/explorer/FiltersBar.svelte';
	import MetricSelector from '$lib/components/explorer/MetricSelector.svelte';
	import ViewMedium from '$lib/components/explorer/medium/ViewMedium.svelte';
	import TimeLineHistogram from '$lib/components/explorer/medium/TimeLineHistogram.svelte';
</script>

<div class='ExplorerMedium'>
	<nav class='filters'>
		<FiltersBar />
	</nav>
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
			"filters timeline metrics";
		grid-template-columns: 18% 67% 15%;
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
		border-right: thin solid var(--colorBorder);
		grid-area: filters;
	}
	.metrics {
		border-left: thin solid var(--colorBorder);
		grid-area: metrics;
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
