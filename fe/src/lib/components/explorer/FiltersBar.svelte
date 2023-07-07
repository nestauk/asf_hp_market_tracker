<script>
	import {getKey, makeMergeAppliedFnMap} from '@svizzle/utils';
	import isEqual from 'just-compare';
	import * as _ from 'lamb';

	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import RegionFilter from '$lib/components/explorer/RegionFilter.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_filtersBar} from '$lib/stores/filters.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';

	const getSelectedCats = _.pipe([
		_.filterWith(_.hasKeyValue('selected', true)),
		_.mapWith(getKey)
	]);

	const enhanceCategories = (categories, selectedCats) => _.map(
		categories,
		makeMergeAppliedFnMap({
			selected: ({key}) => selectedCats.length
				? _.isIn(selectedCats, key)
				: true
		})
	);

	const makeOnRangeChanged = id => ({detail: {min, max}}) => {
		const {filters: oldFilters} = $_selection;
		const newFilters = {
			...oldFilters,
			[id]: {
				gte: min,
				lte: max
			}
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {filters: newFilters}
			});
		}
	}

	const makeOnCatsChanged = id => ({detail: categories}) => {
		const {filters: oldFilters} = $_selection;
		const newFilters = {
			...oldFilters,
			[id]: getSelectedCats(categories)
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {filters: newFilters}
			});
		}
	}

	/* property regions */

	const onPropertyRegionsChanged = ({detail: {regionNames, regionType}}) => {
		const {filters: oldFilters} = $_selection;
		const newFilters = {
			...oldFilters,
			propertyRegionNames: regionNames,
			propertyRegionType: regionType,
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {filters: newFilters}
			});
		}
	}
</script>

{#if $_filtersBar}
	<Scroller>
		<RegionFilter
			on:apply={onPropertyRegionsChanged}
			targetRegionNames={$_selection.filters.propertyRegionNames}
			targetRegionType={$_selection.filters.propertyRegionType}
			title='Property regions'
		/>
		{#each $_filtersBar as {key: entity, values: metrics}}
			<h2>{entity}</h2>
			<ul>
				{#each metrics as metric}
					{@const queryValue = $_selection.filters[metric.id]}
					{#if metric.id !== 'installation_date'}
						<li>
							<div class='slider'>
								<h3>{metric.label}</h3>
								{#if metric.type === 'number'}
									<RangeSlider
										formatFn={metric.formatFn}
										Max={metric.max}
										max={queryValue?.lte || metric.max}
										Min={metric.min}
										min={queryValue?.gte || metric.min}
										on:changed={makeOnRangeChanged(metric.id)}
										theme={$_rangeSlidersTheme}
									/>
								{:else if metric.type === 'category'}
									<CategorySelector
										label={metric.label}
										categories={enhanceCategories(metric.values, queryValue || [])}
										on:applied={makeOnCatsChanged(metric.id)}
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
