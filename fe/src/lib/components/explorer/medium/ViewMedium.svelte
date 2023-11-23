<script>
	import {CenteredView, Icon, Info, LoadingView} from '@svizzle/ui';

	import * as metricInfos from '$lib/_content/metrics/index.js';
	import QuickStatsMedium
		from '$lib/components/explorer/medium/QuickStatsMedium.svelte';
	import ViewSelectorMedium
		from '$lib/components/explorer/medium/ViewSelectorMedium.svelte';
	import Banner from '$lib/components/svizzle/Banner.svelte'
	import Pill from '$lib/components/svizzle/ui/Pill.svelte'
	import {noDataMessage} from '$lib/config/text.js';
	import {isDev} from '$lib/env.js';
	import {
		_currentMetricId,
		_currentMetricTitle,
	} from '$lib/stores/navigation.js';
	import {
		_bannersTheme,
		_currThemeVars,
		_pillTheme,
	} from '$lib/stores/theme.js';
	import {
		_isViewLoading,
		_showMessage,
		_viewDataMessage
	} from '$lib/stores/view.js';

	let isInfoBannerVisible = false;

	const toggleInfoModal = () => {
		isInfoBannerVisible = !isInfoBannerVisible;
	};
	const hideInfoModal = () => {
		isInfoBannerVisible = false
	};

	$: isDev && $_showMessage && console.log('[backend]:', $_viewDataMessage);
</script>

<div class='ViewMedium'>
	<header>
		<h1 title={$_currentMetricTitle}>
			{$_currentMetricTitle}
		</h1>
		{#if $_currentMetricId in metricInfos}
			<button
				aria-label='Metric info'
				on:click={toggleInfoModal}
			>
				<Icon
					glyph={Info}
					size=30
					stroke={$_currThemeVars['--colorIcon']}
					strokeWidth=1.5
				/>
			</button>
		{/if}
		<ViewSelectorMedium />
	</header>
	<main>

		<!-- main grid -->

		<div class='charts'>
			<slot />
		</div>

		<QuickStatsMedium />

		<!-- overlays -->

		{#if $_isViewLoading}
			<div class='overlay'>
				<CenteredView
					backgroundColor={$_currThemeVars['--colorBackground']}
					color={$_currThemeVars['--colorText']}
				>
					<LoadingView
						message='Querying...'
						stroke={$_currThemeVars['--colorText']}
					/>
				</CenteredView>
			</div>
		{:else if $_showMessage}
			<div class='overlay'>
				<CenteredView
					backgroundColor={$_currThemeVars['--colorBackground']}
				>
					<Pill
						label={noDataMessage}
						theme={{
							...$_pillTheme,
							fontSize: '1.1em'
						}}
					/>
				</CenteredView>
			</div>
		{/if}

		{#if isInfoBannerVisible}
			<Banner
				on:close={hideInfoModal}
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
		grid-template-rows: min-content 100%;
		height: 100%;
		overflow: hidden;
		width: 100%;
	}

	header {
		align-items: center;
		display: grid;
		gap: 1em;
		grid-template-columns: auto 1fr max-content;
		overflow: hidden;
		padding: 0 1em;
		width: 100%;
	}
	h1 {
		font-size: 1.5em;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
	}
	header button {
		justify-self: start;
	}
	main {
		display: grid;
		grid-template-rows: 90% 10%;
		position: relative;
	}
	.charts {
		padding: 1em;
	}
	.overlay {
		height: 100%;
		pointer-events: none;
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
	button:focus-visible {
		outline: var(--outline);
	}

	.info {
		padding: 0.75em;
	}
</style>
