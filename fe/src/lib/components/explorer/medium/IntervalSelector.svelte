<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';

	const selectionChanged = ({detail: interval}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {interval}
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
		value={$_selection.interval}
		values={['1M', '1q', '1y']}
	/>
</div>

<style>
	.centered {
		align-items: center;
		display: flex;
		justify-content: center;
	}
</style>
