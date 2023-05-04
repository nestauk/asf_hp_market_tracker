import {backendURL} from '$lib/config.js';

export const queryViewData = ({viewQueryPath}) =>
	fetch(`${backendURL}/${viewQueryPath}`)
	.then((response) => response.json());
