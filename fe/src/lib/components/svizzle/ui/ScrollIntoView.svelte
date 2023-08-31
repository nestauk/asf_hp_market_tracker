<script>
	export let alignToTop;
	export let doIt;

	let element;

	$: alignToTop = alignToTop ?? false;
	$: doIt = doIt ?? false;

	$: if (element && doIt) {
		element.scrollIntoView(alignToTop);
	}
</script>

<div bind:this={element}>
	<slot/>
</div>
