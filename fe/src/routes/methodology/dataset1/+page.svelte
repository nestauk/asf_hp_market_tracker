<script>
	import Aspect1 from '$lib/_content/methodology/Aspect1.svx';

	import {toolName} from '$lib/config';
</script>

<svelte:head>
	<title>Methodology - {toolName}</title>
	<meta
		content='{toolName}: methodology used to produce the dataset of aspect 1'
		name='description'
	>
</svelte:head>

<Aspect1/>
