<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const sortingChanged = ({detail: stringsStreamgraphsSorting}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {stringsStreamgraphsSorting}
		});
</script>

<XorSelector
	on:changed={sortingChanged}
	theme={$_xorSelectorTheme}
	value={$_selection.stringsStreamgraphsSorting}
	values={['off', 'asc', 'desc']}
/>
