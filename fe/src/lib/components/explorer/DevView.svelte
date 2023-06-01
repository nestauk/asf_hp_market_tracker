<script>
	import {Scroller} from '@svizzle/ui';
	import {_viewData} from '$lib/stores/view.js';
</script>

<div class='DevView'>
	<Scroller>
		<code>{JSON.stringify($_viewData, null, 2)}</code>
	</Scroller>
</div>

<style>
	.DevView {
		height: 100%;
		overflow-x: auto;
		white-space: pre-wrap;
		width: 100%;
	}
</style>
