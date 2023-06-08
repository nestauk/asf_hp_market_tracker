<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const intervalChanged = ({detail: interval}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {interval}
		});
</script>

<XorSelector
	on:changed={intervalChanged}
	theme={$_xorSelectorTheme}
	value={$_selection.interval}
	values={['1M', '1q', '1y']}
/>
