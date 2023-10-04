<script>
	import XorSelector from '$lib/components/svizzle/ui/XorSelector.svelte';
	import {explorerActor} from '$lib/statechart/index.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_xorSelectorTheme} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {uiTooltips, settingToLabel} from '$lib/config/labels.js';

	export let name;
	export let showTooltip = true;

	// exclusive props
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
	$: onMouseMove = $_isSmallScreen || !showTooltip
		? null
		: ({detail: {key, x, y}}) => {
			$_tooltip = {
				key: uiTooltips[`${name}_${key}`] || key,
				x,
				y
			}
		}
	$: label = settingToLabel[name];
</script>

<XorSelector
	{label}
	{value}
	{values}
	{valuesToLabels}
	on:changed={makeSetSelectionValue(name)}
	on:mouseleave={clearTooltip}
	on:mousemove={onMouseMove}
	theme={$_xorSelectorTheme}
/>
