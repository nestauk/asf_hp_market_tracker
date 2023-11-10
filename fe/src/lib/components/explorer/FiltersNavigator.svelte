<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {getValues, isIterableEmpty, isIterableNotEmpty} from '@svizzle/utils';
	import {Icon, X, XCircle} from '@svizzle/ui';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import {makeOnKeyDown} from '$lib/components/svizzle/ui/handlers.js';
	import {metricLabelById} from '$lib/data/metrics.js';
	import {_isDefaultInstallationDateExtent} from '$lib/stores/filters.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_filtersNavigatorTheme} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {getField} from '$lib/utils/getters.js';

	const dispatch = createEventDispatcher();

	const idToLabel = id =>
		metricLabelById[id] ||
		{
			installation_date: 'Installation dates',
			installer_geo_region: 'Installer regions',
			property_geo_region: 'Property regions',
			heat_pump_brands_models: 'Heat pump brands and models',
		}[id];

	/* hover */

	const hoveredId = id => {
		if (id === 'installation_date') {
			clearTooltip();

			return;
		}

		const label = idToLabel(id);
		const key = `Scroll to: ${label}`;

		return ({x, y}) => {
			$_tooltip = {key, x, y}
		}
	}
	const hoveredReset = id => {
		const label = idToLabel(id);
		const key = `Reset: ${label}`;

		return ({x, y}) => {
			$_tooltip = {key, x, y}
		}
	}

	/* click */

	const clickedId = id => {
		if (!$_isSmallScreen && id === 'installation_date') {
			return;
		}

		dispatch('selectId', id);
	}
	const clickedReset = id => {
		dispatch('resetId', id);

		if (!$_isSmallScreen) {
			clearTooltip();
		}
	}
	const onResetAll = () => dispatch('resetAll');

	const getActiveFilterIds = _.pipe([
		_.skip(['installerRegionType', 'propertyRegionType']),
		_.rename({
			installerRegionNames: 'installer_geo_region',
			propertyRegionNames: 'property_geo_region',
		}),
		_.skipIf(isIterableEmpty),
		_.keys
	]);
 	const filtersByFields = {
		hp_id_brand: 'heat_pump_brands_models',
		hp_id_model: 'heat_pump_brands_models',
	}
	const getFrom = _.curry(_.getIn);
	const getActiveStringsFilters = _.pipe([
		_.filterWith(_.pipe([getValues, isIterableNotEmpty])),
		_.mapWith(_.pipe([getField, getFrom(filtersByFields)])),
		_.uniques
	]);
	$: filters = $_isDefaultInstallationDateExtent
		? _.skip(['installation_date'], $_selection.filters)
		: $_selection.filters;
	$: activeFilterIds =[
		...getActiveFilterIds(filters),
		...getActiveStringsFilters($_selection.stringsFilters),
	];
	$: hasFilters = activeFilterIds.length >= 1;
	$: hasMultipleFilters = activeFilterIds.length >= 2;

	$: style = makeStyleVars($_filtersNavigatorTheme);
</script>

<div
	{style}
	class='FiltersNavigator'
>
	{#if hasFilters}
		<div
			class:small={$_isSmallScreen}
			class='list'
			on:mouseleave={clearTooltip}
			role='none'
		>

			<!-- reset all: small -->

			{#if hasMultipleFilters && $_isSmallScreen}
				<div
					class='flex listItem clickable'
					on:click={onResetAll}
					on:keydown={makeOnKeyDown(onResetAll)}
					role='button'
					tabindex='0'
				>
					<span class='label resetAll'>
						Reset all filters
					</span>
					<div class='button marginLeft'>
						<Icon
							glyph={XCircle}
							size=16
						/>
					</div>
				</div>
			{/if}

			<!-- current filters -->

			<div
				class='filters'
				on:mouseleave={clearTooltip}
				role='none'
			>
				{#each activeFilterIds as id}
					<div class='flex listItem selection'>
						<span
							class:clickable={$_isSmallScreen || id !== 'installation_date'}
							class='label'
							on:click={clickedId(id)}
							on:keydown={makeOnKeyDown(() => dispatch('selectId', id))}
							on:mousemove={$_isSmallScreen ? null : hoveredId(id)}
							role='button'
							tabindex='0'
						>
							{idToLabel(id)}
						</span>
						<div class='button clickable'
							on:mouseenter={$_isSmallScreen ? null : hoveredReset(id)}
							on:click={() => clickedReset(id)}
							on:keydown={makeOnKeyDown(() => clickedReset(id))}
							role='button'
							tabindex='0'
						>
							<Icon
								glyph={X}
								size=16
							/>
						</div>
					</div>
				{/each}
			</div>

			<!-- reset all: medium -->

			{#if hasMultipleFilters && !$_isSmallScreen}
				<div
					class='flex listItem clickable'
					on:click={onResetAll}
					on:keydown={makeOnKeyDown(onResetAll)}
					on:mouseleave={clearTooltip}
					role='button'
					tabindex='0'
				>
					<span class='label resetAll'>
						Reset all filters
					</span>
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						class='button marginLeft'
						role='none'
					>
						<Icon
							glyph={XCircle}
							size=16
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.FiltersNavigator {
		height: 100%;
		width: 100%;
	}

	.flex {
		align-items: center;
		display: flex;
	}
	.clickable {
		cursor: pointer;
	}

	.list {
		border-bottom: var(--border);
	}
	.list.small {
		border-bottom: none;
		border-top: var(--border);
	}
	.listItem {
		justify-content: space-between;
		padding: 0.5em 0.7em;
	}
	.selection {
		background-color: var(--backgroundColor);
		border-bottom: var(--border);
		color: var(--textColor);
	}
	.small .selection {
		border-bottom: none;
		border-top: var(--border);
	}
	.label {
		flex: 1;
	}
	.label.resetAll {
		text-align: end;
	}
	.marginLeft {
		margin-left: 1em;
	}
</style>
