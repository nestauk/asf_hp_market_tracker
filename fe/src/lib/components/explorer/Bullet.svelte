<script>
	import {makeStyleVars} from '@svizzle/dom';

	export let backgroundColor;
	export let color;
	export let size = '1.5em';
	export let text = '';

	$: backgroundColor = backgroundColor ?? '#333';
	$: color = color ?? 'white';
	$: size = size ?? '1.5em';
	$: style = makeStyleVars({backgroundColor, color, size});
</script>

<div
	{style}
	class='Bullet'
>
	{text}
</div>

<style>
	.Bullet {
		align-items: center;
		background: var(--backgroundColor);
		border-radius: 50%;
		color: var(--color);
		display: flex;
		justify-content: center;
		min-height: var(--size);
		min-width: var(--size);
	}
</style>
