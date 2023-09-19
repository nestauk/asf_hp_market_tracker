import {writable} from 'svelte/store';

export const _tooltip = writable({
	key: null,
	value: null,
	x: 0,
	y: 0,
});
