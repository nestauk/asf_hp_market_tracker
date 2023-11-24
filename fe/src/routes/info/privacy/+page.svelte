<script>
	import Privacy from '$lib/_content/info/Privacy.svx';
	import {toolName} from '$lib/config/app.js';
</script>

<svelte:head>
	<title>Privacy - {toolName}</title>
	<meta
		content='{toolName}: Privacy statement'
		name='description'
	>
</svelte:head>

<Privacy />
