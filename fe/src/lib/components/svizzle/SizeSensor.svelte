<script>
	import {setupResizeObserver} from '@svizzle/ui';

	export let blockSize;
	export let inlineSize;

	const {_writable, resizeObserver} = setupResizeObserver();

	$: blockSize = $_writable?.blockSize;
	$: inlineSize = $_writable?.inlineSize;
</script>

<div
	class='SizeSensor'
	use:resizeObserver
>
	<slot />
</div>
