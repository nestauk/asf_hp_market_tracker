<script>
	import {setupResizeObserver} from '@svizzle/ui';

	export let blockSize;
	export let inlineSize;

	const {_writable, resizeObserver} = setupResizeObserver();

	$: blockSize = $_writable?.blockSize; // TODO rename to `height`
	$: inlineSize = $_writable?.inlineSize; // TODO rename to `width`
</script>

<div
	class='SizeSensor'
	use:resizeObserver
>
	<slot />
</div>
