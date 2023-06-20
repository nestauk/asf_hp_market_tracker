<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const changed = ({detail: trendType}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {trendType}
		});
</script>

<XorSelector
	on:changed={changed}
	theme={$_xorSelectorTheme}
	value={$_selection.trendType}
	values={['periodic', 'incremental']}
/>
