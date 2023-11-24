<script>
	import DataProcessing from '$lib/_content/methodology/DataProcessing.svx';

	import {toolName} from '$lib/config/app.js';
</script>

<svelte:head>
	<title>Data processing methodology - {toolName}</title>
	<meta
		content='{toolName}: how we collect heat pump installations data'
		name='description'
	>
</svelte:head>

<DataProcessing/>
