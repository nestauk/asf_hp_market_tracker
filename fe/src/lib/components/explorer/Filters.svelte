<script>
	import * as _ from 'lamb';

	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {_staticData} from '$lib/stores/data.js';
	import {_groupedFilters, _filters} from '$lib/stores/filters.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
</script>

{#if $_groupedFilters}
	<Scroller>
		{#each $_groupedFilters as {key: entity, values: metrics}}
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
										on:changed={({detail: {max, min}}) => {
											$_filters[metric.id].max = max;
											$_filters[metric.id].min = min;
										}}
										theme={$_rangeSlidersTheme}
									/>
								{:else if metric.type === 'category'}
									<CategorySelector
										label={metric.label}
										bind:categories={$_filters[metric.id].values}
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
