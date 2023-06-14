import {selectedBeURL} from '$lib/env.js';

export const queryViewData = ({viewQueryPath}) =>
	fetch(`${selectedBeURL}/${viewQueryPath}`)
	.then((response) => response.json());
