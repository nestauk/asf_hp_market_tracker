<script>
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	export let alignToTop;
	export let doIt;

	let element;

	const getFirstScrollableParent = (element) => {
		if (!element) return null;

		const {parentNode} = element;
		const {scrollHeight, clientHeight} = parentNode;

		return scrollHeight > clientHeight
			? parentNode
			: getFirstScrollableParent(parentNode);
	}

	const getIsPartiallyInView = element => {
		const {offsetTop, offsetHeight} = element;
		const {
			offsetHeight: pOffsetHeight,
			scrollTop: pScrollTop
		} = getFirstScrollableParent(element);

		return offsetTop < pScrollTop + pOffsetHeight
			&& offsetTop + offsetHeight > pScrollTop;

/* 		return offsetTop < pScrollTop
			|| offsetTop + offsetHeight > pScrollTop + pOffsetHeight;
 */	}

	$: alignToTop = alignToTop ?? false;
	$: doIt = doIt ?? false;

	$: if (element && doIt) {
		!getIsPartiallyInView(element) && element.scrollIntoView(alignToTop);
		dispatch('scrolled');
	}
</script>

<div bind:this={element}>
	<slot/>
</div>
