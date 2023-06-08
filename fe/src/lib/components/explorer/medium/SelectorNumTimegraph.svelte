<script>
	import {Switch} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_switchTheme} from '$lib/stores/theme.js';

	const toggleNumbersPercentiles = ({detail: numTimeGraph}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {numTimeGraph}
		});
</script>

<Switch
	on:toggled={toggleNumbersPercentiles}
	theme={$_switchTheme}
	value={$_selection.numTimeGraph}
	values={['percentiles', 'average']}
/>
