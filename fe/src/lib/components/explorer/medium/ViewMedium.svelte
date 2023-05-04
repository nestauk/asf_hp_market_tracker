<script>
	import ViewSelector from '$lib/components/explorer/medium/ViewSelector.svelte';
	import {_currentMetricTitle} from '$lib/stores/navigation.js';
</script>

<div class='ViewMedium'>
	<header>
		<h1>{$_currentMetricTitle}</h1>
		<ViewSelector />
	</header>
	<main>
		<slot></slot>
	</main>
	<footer></footer>
</div>

<style>
	.ViewMedium {
		display: grid;
		grid-template-rows: 6% 86% 8%;
		height: 100%;
		width: 100%;
	}

	header {
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 0 1em;
		/* border-bottom: thin solid lightgrey; */
	}
	h1 {
		font-size: 1.5em;
	}
	main {
		padding: 1em;
	}
	footer {
		align-items: center;
		/* border-top: thin solid lightgrey; */
		display: flex;
		justify-content: space-between;
		padding: 0 1em;
	}
</style>
