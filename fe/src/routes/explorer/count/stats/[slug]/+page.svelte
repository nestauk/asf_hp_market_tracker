<script>
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import {_viewCache} from '$lib/stores/data.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_currThemeVars} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {
		getCardinalityValue,
		getCount,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';

	const dataAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: getCount,
		installers_certified: getCount,
		installers_dropped_certifications: getCount,
		installers_new_certifications: getCount,
		installers: getCardinalityValue,
	};

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let doDraw = false;
	let items;

	$: if (proceed) {
		const dataAccessor = dataAccessors[$_currentMetric.id];
		const rawValue = dataAccessor($_viewData.response.data);
		const value = $_currentMetric?.formatFn?.(rawValue) ?? rawValue;
		const unitOfMeasure = $_currentMetric?.unitOfMeasure;

		switch ($_currentMetric.id) {
			case 'hp_feature_power_capacity_sum':
				items = [
					{key: 'number', value: value},
					{key: 'unitOfMeasure', value: unitOfMeasure},
					{key: 'text', value: 'total power capacity for the current selection'},
				];
				break;
			case 'hp_feature_power_generation_sum':
				items = [
					{key: 'number', value: value},
					{key: 'unitOfMeasure', value: unitOfMeasure},
					{
						key: 'text',
						value: 'total power generation for the current selection'
					},
				];
				break;
			case 'installation_cost_sum':
				items = [
					{key: 'number', value: value},
					{key: 'unitOfMeasure', value: unitOfMeasure},
					{
						key: 'text',
						value: 'spent on installations for the current selection'
					},
				];
				break;
			case 'installations':
				items = [
					{key: 'number', value: value},
					{key: 'text', value: 'installations for the current selection'},
				];
				break;
			case 'installers_dropped_certifications':
				items = [
					{key: 'number', value: value},
					{
						key: 'text',
						value: 'certifications expired for the current selection'
					},
				];
				break;
			case 'installers_new_certifications':
				items = [
					{key: 'number', value: value},
					{
						key: 'text',
						value: 'new/renewed certifications for the current selection'
					},
				];
				break;
			case 'installations_per_installer':
				items = [
					{key: 'text', value: 'Average of '},
					{key: 'number', value: value},
					{
						key: 'text',
						value: 'installations/installer for the current selection'
					},
				];
				break;
			case 'installers_certified':
				items = [
					{key: 'number', value: value},
					{
						key: 'text',
						value: 'installers were certified for the current selection'
					},
				];
				break;
			case 'installers':
				items = [
					{key: 'number', value: value},
					{
						key: 'text',
						value: 'installers installed heat pumps for the current selection'
					},
				];
				break;
			default:
				break;
		}

		doDraw = true;
	}
</script>

{#if doDraw}
	{#if $_isSmallScreen}
		<View id='stats' >
			<GridRows rowLayout='min-content 1fr'>
				<MetricTitle />

				<div class='container'>
					<div class='content'>
						{#each items as {key, value}}
							<span class={key}>{value}</span>
						{/each}
					</div>
				</div>
			</GridRows>
		</View>
	{:else}
		<div class='container'>
			<div class='content'>
				{#each items as {key, value}}
					<span class={key}>{value}</span>
				{/each}
			</div>
		</div>
	{/if}
{/if}

<style>
	.container {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: var(--padding);
		text-align: center;
		width: 100%;
	}

	.content {
		align-items: baseline;
		display: flex;
		flex-wrap: wrap;
		gap: 1em;
		justify-content: center;
	}
	.number {
		font-size: 3em;
	}
	.text {
		font-size: 1.5em;
	}
	.unitOfMeasure {
		font-size: 2em;
	}

</style>
