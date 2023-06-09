<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const sortingChanged = ({detail: categsStreamgraphsSorting}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {categsStreamgraphsSorting}
		});
</script>

<XorSelector
	on:changed={sortingChanged}
	theme={$_xorSelectorTheme}
	value={$_selection.categsStreamgraphsSorting}
	values={['off', 'asc', 'desc']}
/>
