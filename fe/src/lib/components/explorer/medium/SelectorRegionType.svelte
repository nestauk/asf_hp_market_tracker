<script>
	import SelectionXor from '$lib/components/explorer/medium/SelectionXor.svelte';
	import {_selection} from '$lib/stores/navigation.js';
</script>

<SelectionXor
	name='regionType'
	values={$_selection.regionTypes}
/>
