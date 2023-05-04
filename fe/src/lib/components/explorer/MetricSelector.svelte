<script>
	import {Link, Scroller} from '@svizzle/ui';

	import {metricGroups} from '$lib/data/metrics.js';
	import {_activeViewType, _currentMetricId} from '$lib/stores/navigation.js';
</script>

<Scroller>
	{#each metricGroups as {key, value}}
		<h2>{key}</h2>
		<ul>
			{#each value as {id, label, type}}
				<li>
					<Link href='/explorer/{type}/{$_activeViewType}/{id}'>
						<div
							class:selected={id === $_currentMetricId}
							class='item'
						>
							{label}
						</div>
					</Link>
				</li>
			{/each}
		</ul>
	{/each}
</Scroller>

<style>
	h2 {
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	ul {
		list-style-type: none;
	}
	li:hover {
		background-color: var(--colorAux);
		color: var(--colorAuxText);
		cursor: pointer;
	}
	.item {
		padding: 0.3em 1rem;
	}
	.item.selected {
		background-color: var(--colorSelectedBackground) !important;
		color: var(--colorSelectedText) !important;
	}
</style>
