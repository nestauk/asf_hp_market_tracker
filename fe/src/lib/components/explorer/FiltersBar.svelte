<script>
	import {Scroller} from '@svizzle/ui';
	import {
		areEqual,
		getKey,
		isObjEmpty,
		makeIsIncluded,
		makeMergeAppliedFnMap,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import BrandsModelsSelector
		from '$lib/components/explorer/BrandsModelsSelector.svelte';
	import CategorySelector
		from '$lib/components/explorer/CategorySelector.svelte';
	import FilterPaneBorder
		from '$lib/components/explorer/FilterPaneBorder.svelte';
	import FiltersNavigator
		from '$lib/components/explorer/FiltersNavigator.svelte';
	import RegionFilter from '$lib/components/explorer/RegionFilter.svelte';
	import Timeline from '$lib/components/explorer/Timeline.svelte';
	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import SizeSensor from '$lib/components/svizzle/SizeSensor.svelte';
	import ScrollIntoView from '$lib/components/svizzle/ui/ScrollIntoView.svelte';
	import {getRegionsSelection} from '$lib/utils/regions.js';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_staticData} from '$lib/stores/data.js';
	import {_filtersBar, _installationDateExtent} from '$lib/stores/filters.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
	import {getField, getSelected} from '$lib/utils/getters.js';

	/* numbers */

	const makeOnRangeChanged = id => ({detail: {min, max}}) => {
		const {filters: oldFilters} = $_selection;
		const idStats = $_staticData.numStatsById[id];

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

		if (!areEqual([oldFilters, newFilters])) {
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
		const catStats = $_staticData.catStatsById[id];

		let newFilters;
		if (selectedCats.length === catStats.length) {
			newFilters = _.skipIn(oldFilters, [id]);
		} else {
			newFilters = _.setIn(oldFilters, id, getSelectedCats(categories));
		}

		if (!areEqual([oldFilters, newFilters])) {
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

		if (!areEqual([oldFilters, newFilters])) {
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

		if (!areEqual([oldFilters, newFilters])) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
					...regionsSelection
				}
			});
		}
	}

	/* HP brands & models */

	const onBrandsModelsChanged = ({detail: stringsFilters}) => {
		const {stringsFilters: oldStringsFilters} = $_selection;

		if (!areEqual([oldStringsFilters, stringsFilters])) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					stringsFilters
				}
			});
		}
	}

	/* filters navigator */

	const fieldsByStringsFilters = {
		heat_pump_brands_models: ['hp_id_brand', 'hp_id_model'],
	}
	const resetStringFilter = id => {
		const {stringsFilters: oldStringsFilters} = $_selection;

		const removeFilterId = _.filterWith(
			_.pipe([
				getField,
				_.not(makeIsIncluded(fieldsByStringsFilters[id]))
			])
		);
		const newStringsFilters = removeFilterId(oldStringsFilters)

		if (!areEqual([oldStringsFilters, newStringsFilters])) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					stringsFilters: newStringsFilters,
				}
			});
		}
	}

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

		if (!areEqual([oldFilters, newFilters])) {
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
			installation_date: {
				gte: $_installationDateExtent.Min,
				lte: $_installationDateExtent.Max,
			},
			installerRegionNames: [],
			installerRegionType: $_selection.filters.installerRegionType,
			propertyRegionNames: [],
			propertyRegionType: $_selection.filters.propertyRegionType,
		}
		const newStringsFilters = [];

		if (!areEqual([oldFilters, newFilters])) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {
					filters: newFilters,
					stringsFilters: newStringsFilters,
				}
			});
		}
	}

	let activeFilterId;

	const onSelectId = ({detail: id}) => {
		activeFilterId = id;
	}

	const resetActiveFilterId = () => {
		activeFilterId = undefined;
	}

	const onResetId = ({detail: id}) => {
		if (['heat_pump_brands_models'].includes(id)) {
			resetStringFilter(id);
		} else {
			resetFilter(id);
		}
	};

	let navHeight;

	$: style = `--navHeight:${navHeight}px`;
	$: selectedBrandsModels = $_selection.stringsFilters;
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
					<section>
						<header class='h2'>{entity}</header>
						<ul>
							{#each metrics as metric}
								{@const queryValue = $_selection.filters[metric.id]}

								<ScrollIntoView
									alignToTop={true}
									doIt={metric.id === activeFilterId}
									on:scrolled={resetActiveFilterId}
								>
									{#if metric.id === 'installer_geo_region'}
										<li>
											<section>
												<header class='h3'>Region</header>
												<RegionFilter
													id={metric.id}
													on:apply={onInstallerRegionsChanged}
													targetRegionNames={$_selection.filters.installerRegionNames}
													targetRegionType={$_selection.filters.installerRegionType}
												/>
											</section>
										</li>
									{:else if metric.id === 'property_geo_region'}
										<li>
											<section>
												<header class='h3'>Region</header>
												<RegionFilter
													id={metric.id}
													on:apply={onPropertyRegionsChanged}
													targetRegionNames={$_selection.filters.propertyRegionNames}
													targetRegionType={$_selection.filters.propertyRegionType}
												/>
											</section>
										</li>
									{:else if metric.id === 'heat_pump_brands_models'}
										<li>
											<section>
												<header class='h3'>Brands & Models</header>
												<BrandsModelsSelector
													{selectedBrandsModels}
													on:apply={onBrandsModelsChanged}
												/>
											</section>
										</li>
									{:else if metric.id === 'installation_date' && $_isSmallScreen}
										<li>
											<section>
												<header class='h3'>Date</header>
												<FilterPaneBorder
													isEdited={_.has($_selection.filters, metric.id)}
												>
													<div class='timeline'>
														<Timeline
															geometry={{
																safetyLeft: 15,
																safetyRight: 15,
															}}
														/>
													</div>
												</FilterPaneBorder>
											</section>
										</li>
									{:else if metric.id !== 'installation_date'}
										<li>
											<section>
												<header class='h3'>{metric.label}</header>
												{#if metric.type === 'number'}
													<FilterPaneBorder
														isEdited={_.has($_selection.filters, metric.id)}
													>
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
														on:applied={makeOnCatsChanged(metric.id)}
													/>
												{/if}
											</section>
										</li>
									{/if}
								</ScrollIntoView>
							{/each}
						</ul>
					</section>
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
	.h2 {
		font-size: 1.5em;
		font-weight: 400;
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	.h3 {
		font-size: 1.2em;
		font-weight: 400;
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
