<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const setStringsTimeGraph = ({detail: stringsTimeGraph}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {stringsTimeGraph}
		});
</script>

<XorSelector
	on:changed={setStringsTimeGraph}
	theme={$_xorSelectorTheme}
	value={$_selection.stringsTimeGraph}
	values={['trends', 'streams']}
/>
