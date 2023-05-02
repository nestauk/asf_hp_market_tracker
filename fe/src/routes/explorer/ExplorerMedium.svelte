<div class='ExplorerMedium'>
	<div class='filters' />
	<div class='metrics' />
	<div class='timeline' />
	<div class='view' />
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
		grid-area: filters;
		border-right: thin solid var(--colorBorder);
	}
	.metrics {
		grid-area: metrics;
		border-left: thin solid var(--colorBorder);
	}
	.timeline {
		grid-area: timeline;
		border-top: thin solid var(--colorBorder);
	}
	.view {
		grid-area: view;
	}
</style>
