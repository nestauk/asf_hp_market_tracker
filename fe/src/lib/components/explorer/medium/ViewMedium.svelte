<script>
	import {CenteredView, LoadingView} from '@svizzle/ui';

	import ViewSelector from '$lib/components/explorer/medium/ViewSelector.svelte';
	import {_currentMetricTitle} from '$lib/stores/navigation.js';
	import {_isViewLoading} from '$lib/stores/view.js';
</script>

<div class='ViewMedium'>
	<header>
		<h1>{$_currentMetricTitle}</h1>
		<ViewSelector />
	</header>
	<main>
		<div class='charts'>
			<slot></slot>
		</div>
		<div class='coverage'>coverage</div>

		{#if $_isViewLoading}
			<div class='loading'>
				<CenteredView backgroundColor='rgba(0,0,0,0.05)'>
					<LoadingView message='Querying...'/>
				</CenteredView>
			</div>
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
</style>
