<script>
	import Geography from '$lib/_content/methodology/Geography.svx';

	import {toolName} from '$lib/config';
</script>

<svelte:head>
	<title>Methodology - {toolName}</title>
	<meta
		content='{toolName}: methodology used to produce the dataset of aspect 2'
		name='description'
	>
</svelte:head>

<Geography />
