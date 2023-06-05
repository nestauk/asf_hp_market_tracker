<script>
	import {MessageView} from '@svizzle/ui';

	import {page as _page} from '$app/stores';
	import {_viewData} from '$lib/stores/view.js';

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_page.route.id === $_viewData?.page.route.id;

	let count;

	$: if (proceed) {
		count = $_viewData.response.data.count;
	}
</script>

<MessageView
	text='There are {count} installation for the current filter'
/>
