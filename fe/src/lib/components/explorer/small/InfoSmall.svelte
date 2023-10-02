<script>
	import * as metricInfos from '$lib/_content/metrics/index.js';
	import CoverageSmall from '$lib/components/explorer/small/CoverageSmall.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {_currentMetricId} from '$lib/stores/navigation.js';
</script>

<div class='InfoSmall'>
	<GridRows
		padding='0'
		rowLayout='min-content 1fr'
	>
		<MetricTitle />

		<Scroller>
			<div class='body'>
				<h3>Coverage for the current selection</h3>
				<CoverageSmall />

				<h3>This metric</h3>
				<div class='info'>
					<svelte:component this={metricInfos[$_currentMetricId]} />
				</div>
			</div>
		</Scroller>
	</GridRows>
</div>

<style>
	.InfoSmall {
		height: 100%;
		width: 100%;
	}

	h3 {
		margin-bottom: 1em;
	}
	.body {
		height: 100%;
		padding: 1.5em;
		width: 100%;
	}

</style>
