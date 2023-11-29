<script>
	import {View, ViewsXor} from '@svizzle/ui';

	import {page as _page} from '$app/stores';
	import ExplorerMedium from '$lib/components/layout/medium/ExplorerMedium.svelte';
	import ExplorerSmall from '$lib/components/layout/small/ExplorerSmall.svelte';
	import {toolName} from '$lib/config/app.js';
	import {explorerActor} from '$lib/statechart/index.js';
    import {_staticData} from '$lib/stores/data.js';
	import {_screenId} from '$lib/stores/layout.js';

	explorerActor.send({type: 'MOUNTED'});

	// TBD Machine states StaticData and ViewData are parallel but in practice
	// ViewData cannot start before StaticData has finished loading.
	$: $_staticData && explorerActor.send({type: 'PAGE_CHANGED', page: $_page});
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
		<ExplorerSmall>
			<slot />
		</ExplorerSmall>
	</View>
</ViewsXor>
