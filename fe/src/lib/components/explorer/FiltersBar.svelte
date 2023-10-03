<script>
	import {getKey, isObjEmpty, makeMergeAppliedFnMap} from '@svizzle/utils';
	import isEqual from 'just-compare';
	import * as _ from 'lamb';

	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import FilterPaneBorder
		from '$lib/components/explorer/FilterPaneBorder.svelte';
	import FiltersNavigator
		from '$lib/components/explorer/FiltersNavigator.svelte';
	import RegionFilter from '$lib/components/explorer/RegionFilter.svelte';
	import Timeline from '$lib/components/explorer/Timeline.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import SizeSensor from '$lib/components/svizzle/SizeSensor.svelte';
	import ScrollIntoView from '$lib/components/svizzle/ui/ScrollIntoView.svelte';
	import {getRegionsSelection} from '$lib/utils/regions.js';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_staticData} from '$lib/stores/data.js';
	import {_filtersBar} from '$lib/stores/filters.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
	import {getSelected} from '$lib/utils/getters.js';

	/* numbers */

	const makeOnRangeChanged = id => ({detail: {min, max}}) => {
		const {filters: oldFilters} = $_selection;
		const idStats = $_staticData.numStats[id];

		const criteria = {};
		if (min !== idStats.min) {
			criteria.gte = min;
		}
		if (max !== idStats.max) {
			criteria.lte = max;
		}

		let newFilters;
		if (isObjEmpty(criteria)) {
			newFilters = _.skipIn(oldFilters, [id]);
		} else {
			newFilters = _.setIn(oldFilters, id, criteria);
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {filters: newFilters}
			});
		}
	}

	/* categories */

	const enhanceCategories = (categories, selectedCats) => _.map(
		categories,
		makeMergeAppliedFnMap({
			selected: ({key}) => selectedCats.length
				? _.isIn(selectedCats, key)
				: true
		})
	);

	const getSelectedCats = _.pipe([
		_.filterWith(_.hasKeyValue('selected', true)),
		_.mapWith(getKey)
	]);
	const makeOnCatsChanged = id => ({detail: categories}) => {
		const {filters: oldFilters} = $_selection;
		const selectedCats = _.filter(categories, getSelected);
		const catStats = $_staticData.catStats[id];

		let newFilters;
		if (selectedCats.length === catStats.length) {
			newFilters = _.skipIn(oldFilters, [id]);
		} else {
			newFilters = _.setIn(oldFilters, id, getSelectedCats(categories));
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {filters: newFilters}
			});
		}
	}

	/* installer regions */

	const onInstallerRegionsChanged = ({detail: {regionNames, regionType}}) => {
		const {filters: oldFilters} = $_selection;
		const newFilters = {
			...oldFilters,
			installerRegionNames: regionNames,
			installerRegionType: regionType,
		}

		const regionsSelection = getRegionsSelection({
			currentMetric: $_currentMetric,
			filters: newFilters,
			regionType: $_selection.regionType
		});

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
					...regionsSelection
				}
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

		const regionsSelection = getRegionsSelection({
			currentMetric: $_currentMetric,
			filters: newFilters,
			regionType: $_selection.regionType
		});

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
					...regionsSelection
				}
			});
		}
	}

	/* filters navigator */

	const resetFilter = id => {
		const {filters: oldFilters} = $_selection;

		let newFilters;
		if (id === 'installer_geo_region') {
			newFilters = _.setIn(oldFilters, 'installerRegionNames', []);
		} else if (id === 'property_geo_region') {
			newFilters = _.setIn(oldFilters, 'propertyRegionNames', []);
		} else {
			newFilters = _.skipIn(oldFilters, [id]);
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
				}
			});
		}
	}

	const resetAllFilters = () => {
		const {filters: oldFilters} = $_selection;

		const newFilters = {
			installerRegionNames: [],
			installerRegionType: $_selection.filters.installerRegionType,
			propertyRegionNames: [],
			propertyRegionType: $_selection.filters.propertyRegionType,
		}

		if (!isEqual(oldFilters, newFilters)) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
				}
			});
		}
	}

	let activeFilterId;

	const onSelectId = ({detail: id}) => {
		activeFilterId = id;
	}
	const onResetId = ({detail: id}) => {
		resetFilter(id);
	};

	let navHeight;

	$: style = `--navHeight:${navHeight}px`;
</script>

<div
	{style}
	class='FiltersBar'
	class:small={$_isSmallScreen}
>
	<div class='navigator'>
		<SizeSensor bind:blockSize={navHeight}>
			<FiltersNavigator
				on:selectId={onSelectId}
				on:resetId={onResetId}
				on:resetAll={resetAllFilters}
			/>
		</SizeSensor>
	</div>

	<div class='filters'>
		{#if $_filtersBar}
			<Scroller>
				{#each $_filtersBar as {key: entity, values: metrics}}
					<h2>{entity}</h2>
					<ul>
						{#each metrics as metric}
							{@const queryValue = $_selection.filters[metric.id]}

							<ScrollIntoView
								alignToTop={true}
								doIt={metric.id === activeFilterId}
							>
								{#if metric.id === 'installer_geo_region'}
									<li>
										<h3>Regions</h3>
										<RegionFilter
											id={metric.id}
											on:apply={onInstallerRegionsChanged}
											targetRegionNames={$_selection.filters.installerRegionNames}
											targetRegionType={$_selection.filters.installerRegionType}
										/>
									</li>
								{:else if metric.id === 'property_geo_region'}
									<li>
										<h3>Regions</h3>
										<RegionFilter
											id={metric.id}
											on:apply={onPropertyRegionsChanged}
											targetRegionNames={$_selection.filters.propertyRegionNames}
											targetRegionType={$_selection.filters.propertyRegionType}
										/>
									</li>
								{:else if metric.id === 'installation_date' && $_isSmallScreen}
									<li>
										<h3>Date</h3>
										<FilterPaneBorder id={metric.id}>
											<div class='timeline'>
												<Timeline
													geometry={{
														safetyLeft: 15,
														safetyRight: 15,
													}}
												/>
											</div>
										</FilterPaneBorder>
									</li>
								{:else if metric.id !== 'installation_date'}
									<li>
										<h3>{metric.label}</h3>
										{#if metric.type === 'number'}
											<FilterPaneBorder id={metric.id}>
												<RangeSlider
													formatFn={metric.formatFn}
													items={metric.values}
													Max={metric.max}
													max={queryValue?.lte || metric.max}
													Min={metric.min}
													min={queryValue?.gte || metric.min}
													on:changed={makeOnRangeChanged(metric.id)}
													theme={$_rangeSlidersTheme}
												/>
											</FilterPaneBorder>
										{:else if metric.type === 'category'}
											<CategorySelector
												categories={enhanceCategories(metric.values, queryValue || [])}
												id={metric.id}
												label={metric.label}
												on:applied={makeOnCatsChanged(metric.id)}
											/>
										{/if}
									</li>
								{/if}
							</ScrollIntoView>
						{/each}
					</ul>
				{/each}
			</Scroller>
		{/if}
	</div>
</div>

<style>
	.FiltersBar {
		display: grid;
		grid-template-areas: 'navigator' 'filters';
		grid-template-columns: 100%;
		grid-template-rows: var(--navHeight) calc(100% - var(--navHeight));
		height: 100%;
		width: 100%;
	}

	.FiltersBar.small {
		grid-template-areas: 'filters' 'navigator';
		grid-template-rows: calc(100% - var(--navHeight)) var(--navHeight);
	}

	.navigator,
	.filters {
		width: 100%;
	}

	.navigator {
		grid-area: navigator;
	}
	.filter {
		grid-area: filters;
	}
	h2 {
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	h3 {
		margin-bottom: 0.25em;
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

	.timeline {
		height: 6em;
		width: 100%;
	}
</style>
