<script>
	import {
		applyFnMap,
		getValue,
		isNotNil,
		makeSplitBy,
		sliceStringAt,
	} from '@svizzle/utils';
	import {format} from 'd3-format';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import SelectionXor
		from '$lib/components/explorer/medium/SelectionXor.svelte';
	import SelectorInterval
		from '$lib/components/explorer/medium/SelectorInterval.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {formatDate} from '$lib/utils/date.js';
	import {
		getCardinalityValue,
		getDocCount,
		getKeyAsString,
		getStatsAvg,
		getStatsSum,
	} from '$lib/utils/getters.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const keyAccessor = getKeyAsString;
	const valueAccessors = {
		hp_feature_power_capacity_sum: getStatsSum,
		hp_feature_power_generation_sum: getStatsSum,
		installation_cost_sum: getStatsSum,
		installations_per_installer: getStatsAvg,
		installations: getDocCount,
		installers_certified: _.getPath('certified.value'),
		installers_dropped_certifications: _.getPath('cardinality.value'),
		installers_new_certifications: _.getPath('cardinality.value'),
		installers: getCardinalityValue,
		property_feature_total_floor_area_sum: getStatsSum,
		property_supply_photovoltaic_sum: getStatsSum,
	}
	const filterOutNils = _.filterWith(_.pipe([getValue, isNotNil]));
	const keyFormatFn = _.pipe([
		makeSplitBy('-'),
		_.getAt(0),
		sliceStringAt([2, 4])
	]);

	let doDraw = false;
	let trends;
	let valueFormatFn;

	$: trendType = $_currentMetric.isAdditive
		? $_selection.trendType
		: 'periodic';

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram.buckets || [];

		const valueAccessor = valueAccessors[$_currentMetric?.id];
		const reshapeItems = _.mapWith(
			applyFnMap({
				key: keyAccessor,
				value: valueAccessor,
			})
		);
		const trend = filterOutNils(reshapeItems(rawItems));
		trends = [{key: 'trend', values: trend}];

		valueFormatFn = $_currentMetric?.formatSpecifier
			? format($_currentMetric.formatSpecifier)
			: $_currentMetric.id === 'installations_per_installer'
				? roundTo1
				: _.identity;

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<FlexBar>
		<SelectorInterval />

		{#if $_currentMetric.isAdditive}
			<SelectionXor
				name='trendType'
				values={['periodic', 'incremental']}
			/>	
		{/if}
	</FlexBar>

	{#if doDraw}
		<Trends
			{keyFormatFn}
			{trends}
			{trendType}
			{valueFormatFn}
			geometry={{
				safetyBottom: 50,
				safetyLeft: 80,
				safetyRight: 80,
				safetyTop: 50,
			}}
			keyType='date'
			preformatDate={formatDate}
			theme={{
				...$_framesTheme,
				curveStroke: $_currThemeVars['--colorBorderAux']
			}}
		/>
	{/if}
</Grid2Rows>
