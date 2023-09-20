<script>
	import SelectionXor from '$lib/components/explorer/SelectionXor.svelte';
	import {intervalToLabel} from '$lib/config/labels.js';
</script>

<SelectionXor
	name='interval'
	valuesToLabels={intervalToLabel}
/>
