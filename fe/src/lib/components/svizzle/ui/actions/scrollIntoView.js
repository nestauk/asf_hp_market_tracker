import {tick} from 'svelte';

export const scrollIntoViewIfTrue = async (node, doScroll) => {
	await tick();

	if (node && doScroll) {
		if (node.scrollIntoViewIfNeeded) {
			node.scrollIntoViewIfNeeded(true); // Chrome/Safari/Edge
		} else {
			node.scrollIntoView(true); // FF
		}
	}
}
