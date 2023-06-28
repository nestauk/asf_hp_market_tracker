<script>
	import * as _ from 'lamb';
	import {RISON} from 'rison2';

	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_staticData} from '$lib/stores/data.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
	import {_filters} from '$lib/stores/filters.js';

	const getFiltertQuery = filters => {
		if (!filters) return null;
		const query = {};
		filters.forEach(({values: metrics}) => {
			_.forEach(
				metrics,
				metric => {
					if (metric.type === 'number') {
						const subQuery = {};
						if (metric.max !== metric.Max) {
							subQuery['lte'] = metric.max;
						}
						if (metric.min !== metric.Min) {
							subQuery['gte'] = metric.min;
						}
						if (_.keys(subQuery).length) {
							query[metric.id] = subQuery;
						}
					} else if (metric.type === 'category') {
						if (_.someIn(metric.values, ({selected}) => !selected)) {
							query[metric.id] = _.pipe([
								_.filterWith(_.hasKeyValue('selected', true)),
								_.mapWith(_.getKey('key'))
							])(metric.values);
						}
					}
				}
			);
		});
		return _.keys(query).length ? RISON.stringify(query) : '';
	}

	let lastFilterQuery;
	$: filterQuery = getFiltertQuery($_filters);
	$: if (filterQuery !== lastFilterQuery) {
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {filterQuery}
		});
		lastFilterQuery = filterQuery;
	}
</script>

{#if $_filters}
	<Scroller>
		{#each $_filters as {key: entity, values: metrics}, entityIndex}
			<h2>{entity}</h2>
			<ul>
				{#each metrics as metric, metricIndex}
					<li>
						<div class='slider'>
							<h3>{metric.label}</h3>
							{#if metric.type === 'number'}
								<RangeSlider
									formatFn={metric.formatFn}
									Max={metric.Max}
									Min={metric.Min}
									bind:max={$_filters[entityIndex].values[metricIndex].max}
									bind:min={$_filters[entityIndex].values[metricIndex].min}
									theme={$_rangeSlidersTheme}
								/>
							{:else if metric.type === 'category'}
								<CategorySelector
									label={metric.label}
									bind:categories={$_filters[entityIndex].values[metricIndex].values}
								/>
							{/if}
						</div>
					</li>
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
