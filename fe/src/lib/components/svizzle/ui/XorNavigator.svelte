<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {ChevronLeft, ChevronRight, Icon} from '@svizzle/ui';
	import {isNotNil} from '@svizzle/utils';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	export let currentValue;
	export let theme;
	export let valuesToLabels;

	const defaultTheme = {
		border: 'solid 1px black',
		colorBackground: 'white',
		colorIcon: 'black',
		colorIconDisabled: 'grey',
		textColor: 'black',
	}
	const dispatch = createEventDispatcher();
	const updateValue = val => {
		currentValue = val;
		dispatch('changed', val);
	}
	const onKeyDown = (event, val) => {
		if (['Enter', ' '].includes(event.key)) {
			event.preventDefault();
			updateValue(val);
		}
	}

	$: theme = theme ? {...defaultTheme, ...theme} : defaultTheme;
	$: style = makeStyleVars(theme);
	$: values = _.keys(valuesToLabels);
	$: currentLabel = valuesToLabels[currentValue];
	$: currentValueIndex = _.findIndex(values, _.is(currentValue));
	$: prevValue = values[currentValueIndex - 1];
	$: nextValue = values[currentValueIndex + 1];
	$: hasPrevValue = isNotNil(prevValue);
	$: hasNextValue = isNotNil(nextValue);
	$: clickedPrev = () => hasPrevValue && updateValue(prevValue);
	$: clickedNext = () => hasNextValue && updateValue(nextValue);
	$: onKeyDownPrev = event => hasPrevValue && onKeyDown(event, prevValue);
	$: onKeyDownNext = event => hasNextValue && onKeyDown(event, nextValue);
</script>

<div
	{style}
	class='XorNavigator'
>
	<div class='currentLabel'>{currentLabel}</div>
	<button
		aria-label={hasPrevValue ? 'Previous value' : null}
		class:clickable={hasPrevValue}
		class='prev'
		disabled={!hasPrevValue}
		on:click={clickedPrev}
		on:keydown={onKeyDownPrev}
	>
		<Icon glyph={ChevronLeft} />
	</button>
	<button
		aria-label={hasNextValue ? 'Next value' : null}
		class:clickable={hasNextValue}
		class='next'
		disabled={!hasNextValue}
		on:click={clickedNext}
		on:keydown={onKeyDownNext}
	>
		<Icon glyph={ChevronRight} />
	</button>
</div>

<style>
	.XorNavigator {
		align-items: center;
		border: var(--border);
		display: flex;
		user-select: none;
	}

	.currentLabel {
		color: var(--textColor);
		display: block;
		flex: 1;
		padding: 0.5em 1em;
	}

	button {
		background: var(--colorBackground);
		border: none;
		border-left: var(--border);
		color: var(--colorIcon);
		height: 2.5rem;
		width: 2.5rem;
	}
	button:disabled {
		color: var(--colorIconDisabled);
	}
</style>
