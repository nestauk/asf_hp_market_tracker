import {writable} from 'svelte/store';

export const _tooltip = writable({
	height: 0,
	key: null,
	value: null,
	width: 0,
	x: 0,
	y: 0,
});
