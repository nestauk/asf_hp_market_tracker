<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const regionTypeChanged = ({detail: regionType}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {regionType}
		});
</script>

<XorSelector
	on:changed={regionTypeChanged}
	theme={$_xorSelectorTheme}
	value={$_selection.regionType}
	values={[
		'country21',
		'itl21_1',
		'itl21_2',
		'itl21_3',
		'lad21',
		// 'lsoa11',
		// 'msoa11',
	]}
/>
