<script>
	import XorSelector from '$lib/components/svizzle/ui/XorSelector.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';

	export let name;

	// alternative props
	export let values = null;
	export let valuesToLabels = null;

	const makeSetSelectionValue = paramName => ({detail: newValue}) => {
		if (newValue !== $_selection[paramName]) {
			explorerActor.send({
				type: 'SELECTION_CHANGED',
				newValues: {[paramName]: newValue}
			});
		}
	}

	$: value = $_selection[name];
</script>

<XorSelector
	{value}
	{values}
	{valuesToLabels}
	on:changed={makeSetSelectionValue(name)}
	theme={$_xorSelectorTheme}
/>
