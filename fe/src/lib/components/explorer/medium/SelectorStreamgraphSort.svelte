<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const sortingChanged = ({detail: streamgraphsSorting}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {streamgraphsSorting}
		});
</script>

<XorSelector
	on:changed={sortingChanged}
	theme={$_xorSelectorTheme}
	value={$_selection.streamgraphsSorting}
	values={['off', 'asc', 'desc']}
/>
