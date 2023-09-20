<script>
	import * as _ from 'lamb';

	import FiltersBar from '$lib/components/explorer/FiltersBar.svelte';
	import MetricSelector from '$lib/components/explorer/MetricSelector.svelte';
	import Timeline from '$lib/components/explorer/Timeline.svelte';
	import ViewMedium from '$lib/components/explorer/medium/ViewMedium.svelte';
</script>

<div class='ExplorerMedium'>
	<nav class='colHeader filtersHeader'>
		Filter the data
	</nav>
	<nav class='filters'>
		<FiltersBar />
	</nav>
	<nav class='colHeader metricsHeader'>
		Choose the output
	</nav>
	<nav class='metrics'>
		<MetricSelector />
	</nav>
	<nav class='timeline'>
		<Timeline />
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
			"filtersHeader view metricsHeader"
			"filters view metrics"
			"filters timeline metrics";
		grid-template-columns: 18% 67% 15%;
		grid-template-rows: 4% 86% 10%;
		height: 100%;
		width: 100%;
	}
	.ExplorerMedium > div {
		max-height: 100%;
		overflow: hidden;
		position: relative;
	}

	.colHeader {
		align-items: center;
		border-bottom: var(--border);
		display: flex;
		justify-content: center;
	}
	.filtersHeader {
		border-right: var(--border);
		grid-area: filtersHeader;
	}
	.filters {
		border-right: var(--border);
		grid-area: filters;
	}
	.metricsHeader {
		border-left: var(--border);
		grid-area: metricsHeader;
	}
	.metrics {
		border-left: var(--border);
		grid-area: metrics;
	}
	.timeline {
		align-items: stretch;
		border-top: var(--border);
		display: flex;
		grid-area: timeline;
		justify-content: stretch;
	}
	.view {
		grid-area: view;
	}
</style>
