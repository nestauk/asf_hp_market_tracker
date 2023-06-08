<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const setCategsTimeGraph = ({detail: categsTimeGraph}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {categsTimeGraph}
		});
</script>

<XorSelector
	on:changed={setCategsTimeGraph}
	theme={$_xorSelectorTheme}
	value={$_selection.categsTimeGraph}
	values={['trends', 'streams']}
/>
