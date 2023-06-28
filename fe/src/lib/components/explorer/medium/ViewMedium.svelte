<script>
	import {CenteredView, Icon, Info, LoadingView} from '@svizzle/ui';

	import * as metricInfos from '$lib/_content/metrics/index.js';
	import ViewSelector from '$lib/components/explorer/medium/ViewSelector.svelte';
	import Banner from '$lib/components/svizzle/Banner.svelte'
	import {_currentMetricId, _currentMetricTitle} from '$lib/stores/navigation.js';
	import {_bannersTheme, _currThemeVars} from '$lib/stores/theme.js';
	import {_isViewLoading} from '$lib/stores/view.js';

	let isInfoBannerVisible = false;

	const toggleInfoModal = () => {
		isInfoBannerVisible = !isInfoBannerVisible;
	};
</script>

<div class='ViewMedium'>
	<header>
		<h1>
			{$_currentMetricTitle}
			{#if $_currentMetricId in metricInfos}
				<button on:click={toggleInfoModal}>
					<Icon
						glyph={Info}
						size=30
						stroke={$_currThemeVars['--colorIcon']}
						strokeWidth=1.5
					/>
				</button>
			{/if}
		</h1>
		<ViewSelector />
	</header>
	<main>
		<div class='charts'>
			<slot />
		</div>
		<div class='coverage'>
			coverage
		</div>

		{#if $_isViewLoading}
			<div class='loading'>
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

		{#if isInfoBannerVisible}
			<Banner
				on:close={() => isInfoBannerVisible = false}
				theme={$_bannersTheme}
				width='50%'
			>
				<div class='info'>
					<svelte:component this={metricInfos[$_currentMetricId]} />
				</div>
			</Banner>
		{/if}
	</main>
</div>

<style>
	.ViewMedium {
		display: grid;
		grid-template-rows: 6% 94%;
		height: 100%;
		width: 100%;
	}

	header {
		/* border-bottom: thin solid lightgrey; */
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 0 1em;
	}
	h1 {
		font-size: 1.5em;
	}
	main {
		display: grid;
		grid-template-rows: 93% 7%;
		position: relative;
	}
	.charts {
		padding: 1em;
	}
	.coverage {
		/* border-top: thin solid lightgrey; */
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		padding: 0 1em 1em;
		width: 100%;
	}
	.loading {
		height: 100%;
		position: absolute;
		width: 100%;
	}

	button {
		background: none;
		border: none;
		cursor: pointer;
		margin-left: 0.5em;
		vertical-align: text-top;
	}

	.info {
		padding: 0.75em;
	}
</style>
