<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';

	const selectionChanged = ({detail: regionType}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {regionType}
		});
</script>

<div class='centered'>
	<XorSelector
		on:changed={selectionChanged}
		theme={{
			borderColor: 'var(--colorBorder)',
			selectedColor: 'var(--colorSelectedBackground)',
			selectedTextColor: 'var(--colorSelectedText)',
			textColor: 'var(--colorText)',
		}}
		value={$_selection.regionType}
		values={['itl21_1', 'itl21_2', 'itl21_3', 'lau21_1']}
	/>
</div>

<style>
	.centered {
		align-items: center;
		display: flex;
		justify-content: center;
	}
</style>
