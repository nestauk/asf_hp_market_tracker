<script>
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	export let alignToTop;
	export let doIt;

	let element;

	$: alignToTop = alignToTop ?? false;
	$: doIt = doIt ?? false;

	$: if (element && doIt) {
		element.scrollIntoView(alignToTop);
		dispatch('scrolled');
	}
</script>

<div bind:this={element}>
	<slot/>
</div>
