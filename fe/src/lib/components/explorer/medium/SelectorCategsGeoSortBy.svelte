<script>
	import {XorSelector} from '@svizzle/ui';

	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	const setCategsGeoSortBy = ({detail: categsGeoSortBy}) =>
		explorerActor.send({
			type: 'SELECTION_CHANGED',
			newValues: {categsGeoSortBy}
		});
</script>

<XorSelector
	on:changed={setCategsGeoSortBy}
	theme={$_xorSelectorTheme}
	value={$_selection.categsGeoSortBy}
	values={['regionName', 'total']}
/>
