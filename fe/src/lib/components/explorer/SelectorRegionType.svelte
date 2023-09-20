<script>
	import * as _ from 'lamb';

	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import {regionTypeToLabel} from '$lib/config/labels.js';
	import {_selection} from '$lib/stores/navigation.js';

	$: valuesToLabels = _.pickIn(regionTypeToLabel, $_selection.regionTypes);
</script>

<SelectionXor
	{valuesToLabels}
	name='regionType'
/>
