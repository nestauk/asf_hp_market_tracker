import {writable} from 'svelte/store';

export const _tooltip = writable();

export const clearTooltip = () => {
	_tooltip.set(null);
}
