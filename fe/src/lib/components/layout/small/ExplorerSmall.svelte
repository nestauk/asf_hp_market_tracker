<script>
	import {CenteredView, LoadingView} from '@svizzle/ui';
	import {getId} from '@svizzle/utils'
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import * as metricInfos from '$lib/_content/metrics/index.js';
	import FiltersBar from '$lib/components/explorer/FiltersBar.svelte';
	import MetricSelector from '$lib/components/explorer/MetricSelector.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import IconBar from '$lib/components/explorer/IconBar.svelte';
	import NoData from '$lib/components/explorer/NoData.svelte';
    import ViewSelector from '$lib/components/explorer/medium/ViewSelector.svelte';
    import GridRows from '$lib/components/svizzle/GridRows.svelte';
	import {_currentMetricId} from '$lib/stores/navigation.js';
	import {_currThemeVars} from '$lib/stores/theme.js';
	import {
		_isViewLoading,
		_showMessage,
		_viewDataMessage
	} from '$lib/stores/view.js';
	import {getTabsIcons} from './tabsIcons.js';
    import MetricTitle from '$lib/components/explorer/MetricTitle.svelte';

	$: [,, field_type, chart_type] = $_page.route.id.split('/');
	$: icons = getTabsIcons(`${field_type}/${chart_type}`);
	$: iconsIds = _.map(icons, getId);
	$: viewId = ['filters', 'metrics'].includes(viewId)
		? viewId
		: $_showMessage
			? 'nodata'
			: iconsIds.includes(viewId)
				? viewId // 
				: iconsIds[1]; // default

	// keep this log on in production to know the specifics of a no data message
	$: $_showMessage && console.log('[backend]:', $_viewDataMessage);

	const onViewSelected = ({detail: id}) => {
		console.log('viewId', id)
		viewId = id;
	}
</script>

<div class='ExplorerSmall'>
	<div class='chosenView'>
		<!-- IDEA investigate using ViewSlider (consider sliding when nodata) -->
		<ViewsXor {viewId}>
			<View id='filters'>
				<nav class='filters'>
					<FiltersBar />
				</nav>
			</View>

			<slot />

			<View id='info'>
				<GridRows rowLayout='min-content 1fr'>
					<MetricTitle />

					<div class='info'>
						<svelte:component this={metricInfos[$_currentMetricId]} />
					</div>	
				</GridRows>
			</View>

			<View id='metrics'>
				<nav class='metrics'>
					<MetricSelector />
				</nav>
			</View>

			<View id='nodata'>
				<NoData />
			</View>
		</ViewsXor>
	</div>

	<div class='tabs'>
		<IconBar
			activeIconId={viewId}
			{icons}
			on:selected={onViewSelected}
		/>
	</div>

	<div class='view_selector'>
		<ViewSelector />
	</div>

	{#if $_isViewLoading}
		<div class='overlay'>
			<CenteredView
				backgroundColor={$_currThemeVars['--colorBackdropSensor']}
				color={$_currThemeVars['--colorText']}
			>
				<LoadingView
					message='Querying...'
					stroke={$_currThemeVars['--colorText']}
				/>
			</CenteredView>
		</div>
	{/if}

</div>

<style>
	.ExplorerSmall {
		border-left: var(--border);
		display: grid;
		grid-auto-flow: row;
		grid-template-columns: 100%;
		grid-template-rows: 1fr min-content min-content;
		height: 100%;
		justify-content: stretch;
	}
	.chosenView, .overlay {
		height: 100%;
		overflow: hidden;
	}

	/* TBD */
	.scrollable {
		height: 100%;
		overflow: auto;
	}

	.filters, .metrics {
		overflow: auto;
		height: 100%;
		width: 100%;
	}
	.tworows {
		display: grid;
		grid-template-rows: 1fr min-content;
		justify-items: center;
		height: 100%;
		overflow: hidden;
	}
	.view_selector {
		margin: auto;
	}
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
