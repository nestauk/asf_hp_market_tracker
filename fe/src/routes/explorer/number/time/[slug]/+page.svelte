<script>
	import {
		applyFnMap,
		getKey,
		isNotNil,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import FlexBar from '$lib/components/explorer/FlexBar.svelte';
	import PercentilesTrendsView
		from '$lib/components/explorer/medium/PercentilesTrendsView.svelte';
	import SelectionXor
		from '$lib/components/explorer/medium/SelectionXor.svelte';
	import SelectorInterval
		from '$lib/components/explorer/medium/SelectorInterval.svelte';
	import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
    import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import View from '$lib/components/viewports/View.svelte';
    import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_currentMetric, _selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getKeyAsString} from '$lib/utils/getters.js';

	const keyAccessor = getKeyAsString;
	const valueAccessor = _.pipe([
		_.collect([_.getKey('stats'), _.getPath('percentiles.values')]),
		_.apply(_.merge),
		_.skip(['count', 'sum']),
	]);
	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			values: valueAccessor,
		})
	);
	const filterItems = _.filterWith(
		_.pipe([_.getPath('values.avg'), isNotNil])
	);

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let doDraw = false;
	let items;
	let trends;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram?.buckets || [];
		items = filterItems(reshapeItems(rawItems));

		if ($_selection.numTimeGraph !== 'percentiles') {
			trends = [{
				key: 'Average',
				values: _.map(
					items,
					applyFnMap({
						key: getKey,
						value: _.getPath('values.avg'),
					})
				)
			}];
		}

		doDraw = true;
	}
</script>

{#if $_isSmallScreen}
	{#if doDraw}
		<View id='trends'>
			<GridRows rowLayout='min-content 1fr min-content'>
				<MetricTitle />

				{#if $_selection.numTimeGraph === 'percentiles'}
					<PercentilesTrendsView
						{items}
						valueFormatFn={$_currentMetric?.formatFn}
					/>
				{:else}
					<Trends
						{trends}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						keyType='date'
						theme={{
							...$_framesTheme,
							curveStroke: $_currThemeVars['--colorBorderAux']
						}}
						valueFormatFn={$_currentMetric?.formatFn}
					/>
				{/if}

				<FlexBar canWrap shouldWrapUp>
					<SelectorInterval />
					<SelectionXor
						name='numTimeGraph'
						values={['percentiles', 'average']}
					/>
				</FlexBar>		
			</GridRows>
		</View>
	{/if}
{:else}
	<Grid2Rows percents={[10, 90]}>
		<FlexBar>
			<SelectorInterval />
			<SelectionXor
				name='numTimeGraph'
				values={['percentiles', 'average']}
			/>
		</FlexBar>

		{#if doDraw}
			{#if $_selection.numTimeGraph === 'percentiles'}
				<PercentilesTrendsView
					{items}
					valueFormatFn={$_currentMetric?.formatFn}
				/>
			{:else}
				<Trends
					{trends}
					geometry={{
						safetyBottom: 50,
						safetyLeft: 80,
						safetyRight: 80,
						safetyTop: 50,
					}}
					keyType='date'
					theme={{
						...$_framesTheme,
						curveStroke: $_currThemeVars['--colorBorderAux']
					}}
					valueFormatFn={$_currentMetric?.formatFn}
				/>
			{/if}
		{/if}
	</Grid2Rows>
{/if}

<style>
	.legend {
		align-items: start;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-evenly;
		width: 100%;
		padding: 0;
	}
	li {
		align-items: center;
		display: flex;
		padding: 0.25em;
	}
	.dot {
		border-radius: 50%;
		margin-right: 0.5em;
		min-height: 1em;
		min-width: 1em;
	}
	h3 {
		padding: 0.25em;
	}

	.col1 {
		height: 100%;
		width: 100%;
	}
</style>
