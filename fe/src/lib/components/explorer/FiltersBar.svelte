<script>
	import * as _ from 'lamb';

	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_filtersBar} from '$lib/stores/filters.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
    import {mergeFilters} from '$lib/utils/filters.js';
</script>

{#if $_filtersBar}
	<Scroller>
		{#each $_filtersBar as {key: entity, values: metrics}}
			<h2>{entity}</h2>
			<ul>
				{#each metrics as metric}
					{#if metric.id !== 'installation_date'}
						<li>
							<div class='slider'>
								<h3>{metric.label}</h3>
								{#if metric.type === 'number'}
									<RangeSlider
										formatFn={metric.formatFn}
										Max={metric.Max}
										max={metric.max}
										Min={metric.Min}
										min={metric.min}
										on:changed={({detail: range}) => {
											const newFilters = mergeFilters(
												$_filtersBar,
												entity,
												metric.id,
												range
											);
											explorerActor.send({
												type: 'SELECTION_CHANGED',
												newValues: {filters: newFilters}
											});
										}}
										theme={$_rangeSlidersTheme}
									/>
								{:else if metric.type === 'category'}
									<CategorySelector
										label={metric.label}
										categories={metric.values}
										on:applied={({detail: categories}) => {
											const newFilters = mergeFilters(
												$_filtersBar,
												entity,
												metric.id,
												{values: categories}
											);
											explorerActor.send({
												type: 'SELECTION_CHANGED',
												newValues: {filters: newFilters}
											});
/* 											$_filters[metric.id].values = detail;
											sendFiltersChanged();
 */										}}
									/>
								{/if}
							</div>
						</li>
					{/if}
				{/each}
			</ul>
		{/each}
	</Scroller>
{/if}

<style>
	h2 {
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	ul {
		list-style-type: none;
	}
	li {
		padding: 0.9em 1.5em;
	}
	li:first-child {
		padding-top: 0;
	}

	.slider {
		overflow: hidden;
		width: 100%;
	}
</style>
