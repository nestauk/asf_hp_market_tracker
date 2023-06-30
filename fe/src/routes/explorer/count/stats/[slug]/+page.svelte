<script>
	import {MessageView} from '@svizzle/ui';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import {_viewCache} from '$lib/stores/data.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
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
		property_feature_total_floor_area_sum: getStatsSum,
		property_supply_photovoltaic_sum: getStatsSum,
	};

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let doDraw = false;
	let text;

	$: if (proceed) {
		const dataAccessor = dataAccessors[$_currentMetric.id];
		const rawValue = dataAccessor($_viewData.response.data);
		const value = $_currentMetric?.formatFn?.(rawValue) ?? rawValue;

		switch ($_currentMetric.id) {
			case 'hp_feature_power_capacity_sum':
				text = `${value} total power capacity for the current filter`;
				break;
			case 'hp_feature_power_generation_sum':
				text = `${value} total power generation for the current filter`;
				break;
			case 'installation_cost_sum':
				text = `Total of ${value} GBP spent on installations for the current filter`;
				break;
			case 'installations':
				text = `${value} installations for the current filter`;
				break;
			case 'installers_dropped_certifications':
				text = `${value} certifications expired during the current filer`;
				break;
			case 'installers_new_certifications':
				text = `${value} new/renewed certifications during the current filer`;
				break;
			case 'installations_per_installer':
				text = `Average of ${value} installations/installer for the current filter`;
				break;
			case 'installers_certified':
				text = `${value} installers were certified for the current filter`;
				break;
			case 'installers':
				text = `${value} installers installed heat pumps for the current filter`;
				break;
			case 'property_feature_total_floor_area_sum':
				text = `Total of ${value} m^2 of floor area for the current filter`;
				break;
			case 'property_supply_photovoltaic_sum':
				text = `${value} installed photovoltaic energy generation for the current filter`;
			default:
				break;
		}

		doDraw = true;
	}
</script>

{#if doDraw}
	<MessageView {text} />
{/if}
