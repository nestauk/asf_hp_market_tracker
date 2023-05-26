<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const selectionChanged = ({detail: regionType}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {regionType}
		});
</script>

<div class='centered'>
	<XorSelector
		on:changed={selectionChanged}
		theme={$_xorSelectorTheme}
		value={$_selection.regionType}
		values={[
			'itl21_1',
			'itl21_2',
			'itl21_3',
			'lau21_1',
			// 'lsoa11',
			// 'msoa11',
		]}
	/>
</div>

<style>
	.centered {
		align-items: center;
		display: flex;
		justify-content: center;
	}
</style>
