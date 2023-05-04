import {redirect} from '@sveltejs/kit';
import {get} from 'svelte/store';

import {_expectedRoute} from '$lib/stores/navigation.js';

export function load () {
	const expectedRoute = get(_expectedRoute);
	throw redirect(301, expectedRoute);
}
