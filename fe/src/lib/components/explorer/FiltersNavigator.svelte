<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {isIterableEmpty} from '@svizzle/utils';
	import {Icon, X, XCircle} from '@svizzle/ui';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import {metricLabelById} from '$lib/data/metrics.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_filtersNavigatorTheme} from '$lib/stores/theme.js';
	import {_tooltip} from '$lib/stores/tooltip.js';

	const dispatch = createEventDispatcher();

	const idToLabel = id =>
		metricLabelById[id] ||
		{
			installation_date: 'Installation dates',
			installer_geo_region: 'Installer regions',
			property_geo_region: 'Property regions',
		}[id];

	const clearTooltip = () => {
		$_tooltip = null;
	}
	const hoveredId = id => {
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
	$: activeFilterIds = getActiveFilterIds($_selection.filters);
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
		>

			<!-- reset all: small -->

			{#if hasMultipleFilters && $_isSmallScreen}
				<div
					class='flex listItem clickable'
					on:click={onResetAll}
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
			>
				{#each activeFilterIds as id}
					<div class='flex listItem selection clickable'>
						<span
							class='label'
							on:mousemove={$_isSmallScreen ? null : hoveredId(id)}
							on:click={() => dispatch('selectId', id)}
						>
							{idToLabel(id)}
						</span>
						<div class='button'
							on:mouseenter={$_isSmallScreen ? null : hoveredReset(id)}
							on:click={clickedReset(id)}
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
					on:mouseleave={clearTooltip}
				>
					<span class='label resetAll'>
						Reset all filters
					</span>
					<div
						class='button marginLeft'
						on:click={onResetAll}
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
