<script>
	import {MessageView} from '@svizzle/ui';
	import {format} from 'd3-format';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import {_viewCache} from '$lib/stores/data.js';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {
		getCardinalityValue,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const dataAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: _.getKey('count'),
		installers: getCardinalityValue,
		property_feature_total_floor_area_sum: getStatsSum,
		property_supply_photovoltaic_sum: getStatsSum,
	}

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
		const formatFn = $_currentMetric?.formatSpecifier
			? format($_currentMetric.formatSpecifier)
			: $_currentMetric.id === 'installations_per_installer'
				? roundTo1
				: _.identity;
		const value = formatFn ? formatFn(rawValue) : rawValue;

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
			case 'installations_per_installer':
				text = `Average of ${value} installations/installer for the current filter`;
				break;
			case 'property_feature_total_floor_area_sum':
				text = `Total of ${value} m^2 of floor area for the current filter`;
				break;
			case 'property_supply_photovoltaic_sum':
				text = `${value} installed photovoltaic energy generation for the current filter`;
				break;
			case 'installers':
				text = `${value} installers installed heat pumps for the current filter`;
				break;
			default:
				break;
		}

		doDraw = true;
	}
</script>

{#if doDraw}
	<MessageView {text} />
{/if}
