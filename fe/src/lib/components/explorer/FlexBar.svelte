<script>
	export let canWrap;
	export let shouldWrapUp;

	$: canWrap = canWrap || false;
	$: shouldWrapUp = shouldWrapUp || false;
	$: wrap = canWrap
		? shouldWrapUp
			? 'wrap-reverse'
			: 'wrap'
		: 'nowrap';
</script>

<div
	class='FlexBar'
	style='flex-wrap: {wrap};'
>
	<slot />
</div>

<style>
	.FlexBar {
		align-items: center;
		display: flex;
		justify-content: space-evenly;
		width: 100%;
	}
</style>
