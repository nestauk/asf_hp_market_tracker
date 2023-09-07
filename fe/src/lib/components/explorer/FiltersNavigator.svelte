<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {isIterableEmpty} from '@svizzle/utils';
	import {Icon, X} from '@svizzle/ui';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import {metricLabelById} from '$lib/data/metrics.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_filtersNavigatorTheme} from '$lib/stores/theme.js';

	const dispatch = createEventDispatcher();

	let message;

	const idToLabel = id =>
		metricLabelById[id] ||
		{
			installer_geo_region: 'Installer regions',
			property_geo_region: 'Property regions',
		}[id];

	const clearMessage = () => {
		message = undefined;
	}
	const hoveredId = id => {
		const label = idToLabel(id);
		message = `Scroll to ${label}`;
	}
	const hoveredReset = id => {
		const label = idToLabel(id);
		message = `Reset ${label}`;
	}
	const clickedReset = id => {
		dispatch('resetId', id);
		clearMessage();
	}
	const onResetAll = () => dispatch('resetAll');

	const getActiveFilterIds = _.pipe([
		_.skip(['installation_date', 'installerRegionType', 'propertyRegionType']),
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
			class='list'
			on:mouseleave={clearMessage}
		>
			<!-- current filters -->

			<div
				class='filters'
				on:mouseleave={clearMessage}
			>
				{#each activeFilterIds as id}
					<div class='flex listItem selection clickable'>
						<span
							class='label'
							on:mouseenter={hoveredId(id)}
							on:click={() => dispatch('selectId', id)}
						>
							{idToLabel(id)}
						</span>
						<div class='button'
							on:mouseenter={hoveredReset(id)}
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

			<!-- reset all -->

			{#if hasMultipleFilters}
				<div
					class='flex listItem clickable'
					on:click={onResetAll}
					on:mouseleave={clearMessage}
				>
					<span class='label resetAll'>
						Reset all filters
					</span>
					<div
						class='button'
						on:click={onResetAll}
					>
						<Icon
							glyph={X}
							size=16
						/>
					</div>
				</div>
			{/if}
		</div>
	{/if}
	{#if message && !$_isSmallScreen}
		<div class='flex message'>
			{message}
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
	.listItem {
		justify-content: space-between;
		padding: 0.5em 0.7em;
	}
	.selection {
		background-color: var(--backgroundColor);
		border-bottom: var(--border);
		color: var(--textColor);
	}
	.label {
		flex: 1;
	}
	.label.resetAll {
		text-align: end;
	}
	.button {
		margin-left: 1em;
	}

	.message {
		border-bottom: var(--border);
		height: 100%;
		justify-content: center;
		padding: 0.3em;
		user-select: none;
		width: 100%;
	}
</style>
