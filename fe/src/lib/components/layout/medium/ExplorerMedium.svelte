<script>
	import * as _ from 'lamb';

	import Filters from '$lib/components/explorer/Filters.svelte';
	import MetricSelector from '$lib/components/explorer/MetricSelector.svelte';
	import ViewMedium from '$lib/components/explorer/medium/ViewMedium.svelte';
	import TimeLineHistogram from '$lib/components/explorer/medium/TimeLineHistogram.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_filters, getFilterQuery} from '$lib/stores/filters.js';

	let lastFilterQuery = '';

	$: filterQuery = getFilterQuery($_filters);
	$: if (filterQuery !== lastFilterQuery) {
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {filterQuery}
		});
		lastFilterQuery = filterQuery;
	}
</script>

<div class='ExplorerMedium'>
	<nav class='filters'>
		<Filters />
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
