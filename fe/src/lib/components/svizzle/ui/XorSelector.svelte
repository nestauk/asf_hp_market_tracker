<script>
	import {makeStyleVars} from '@svizzle/dom';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	const dispatch = createEventDispatcher();

	const defaultTheme = {
		borderColor: 'black',
		borderRadius: 0,
		borderWidth: '1px',
		selectedColor: 'black',
		selectedTextColor: 'white',
		textColor: 'black',
	}

	export let theme = null;
	export let value = null;
	export let label;

	// alternative props
	export let values = null;
	export let valuesToLabels = null;

	$: label = label || null;
	$: values = valuesToLabels ? _.keys(valuesToLabels) : values;
	$: currentValue = value ?? values[0];

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: borderRadiusLeft = `${theme.borderRadius} 0 0 ${theme.borderRadius}`;
	$: borderRadiusRight = `0 ${theme.borderRadius} ${theme.borderRadius} 0`;
	$: style = makeStyleVars({
		...theme,
		borderRadiusLeft,
		borderRadiusRight,
	});

	const updateValue = val => {
		currentValue = val;
		dispatch('changed', val);
	}
	const onClick = val => () => updateValue(val);
	const onKeyDown = val => event => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			updateValue(val);
		}
	}
</script>

<div
	{style}
	class='XorSelector'
>
	{#if label}
		<div>{label}</div>
	{/if}
	<div class='selector'>
		{#each values as val}
			<span
				role='button'
				class:selected={currentValue === val}
				on:click={onClick(val)}
				on:keydown={onKeyDown(val)}
				on:mouseenter={({x, y}) => {
					dispatch('mouseenter', {key: val, x, y})
				}}
				on:mouseleave={({x, y}) => {
					dispatch('mouseleave', {key: val, x, y})
				}}
				on:mousemove={({x, y}) => {
					dispatch('mousemove', {key: val, x, y})
				}}
				tabindex='0'
			>
				{valuesToLabels ? valuesToLabels[val] : val}
			</span>
		{/each}
	</div>
</div>

<style>
	.XorSelector {
		--border: var(--borderWidth) solid var(--borderColor);
		align-items: center;
		display: grid;
		grid-template-rows: min-content min-content;
		padding: 0.1rem;
		user-select: none;
		height: 100%;
	}

	.selector {
		align-items: center;
		display: flex;
	}

	span {
		border-bottom: var(--border);
		border-right: var(--border);
		border-top: var(--border);
		color: var(--textColor);
		cursor: pointer;
		padding: 0.5rem 0.6rem;
		white-space: nowrap;
	}
	span:first-child {
		border-left: var(--border);
		border-radius: var(--borderRadiusLeft);
	}
	span:last-child {
		border-radius: var(--borderRadiusRight);
	}
	span.selected {
		background-color: var(--selectedColor);
		color: var(--selectedTextColor);
	}
</style>
