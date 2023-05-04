<script>
	import {page as _page} from '$app/stores';
	import ExplorerMedium from '$lib/components/layout/medium/ExplorerMedium.svelte';
	import View from '$lib/components/viewports/View.svelte';
	import ViewsXor from '$lib/components/viewports/ViewsXor.svelte';
	import {toolName} from '$lib/config';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_screenId} from '$lib/stores/layout';

	explorerActor.send({type: 'MOUNTED'});

	$: explorerActor.send({type: 'PAGE_CHANGED', page: $_page});
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
		<ExplorerMedium>
			<slot />
		</ExplorerMedium>
	</View>
	<View id='small'>
		<slot />
	</View>
</ViewsXor>
