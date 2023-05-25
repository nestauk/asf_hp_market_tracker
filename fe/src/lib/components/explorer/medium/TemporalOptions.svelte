<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	export let showStreamgraphOptions = false;

	const intervalChanged = ({detail: interval}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {interval}
		});
	const sortingChanged = ({detail: streamgraphsSorting}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {streamgraphsSorting}
		});
</script>

<div class='centered'>
	<XorSelector
		on:changed={intervalChanged}
		theme={$_xorSelectorTheme}
		value={$_selection.interval}
		values={['1M', '1q', '1y']}
	/>

	{#if showStreamgraphOptions}
		<XorSelector
			on:changed={sortingChanged}
			theme={$_xorSelectorTheme}
			value={$_selection.streamgraphsSorting}
			values={['off', 'asc', 'desc']}
		/>
	{/if}
</div>

<style>
	.centered {
		align-items: center;
		display: flex;
		justify-content: space-evenly;
	}
</style>
