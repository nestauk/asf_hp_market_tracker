<script>
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {toolName} from '$lib/config';
	import {_screenId} from '$lib/stores/layout';

	import ExplorerMedium from './ExplorerMedium.svelte';

</script>

<svelte:head>
	<title>Explorer - {toolName}</title>
	<meta
		content='The {toolName} data explorer'
		name='description'
	>
</svelte:head>

<ViewsXor viewId={$_screenId}>
	<View id='medium'>
		<ExplorerMedium/>
	</View>
	<View id='small'>
		TODO
	</View>
</ViewsXor>
