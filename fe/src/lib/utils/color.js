import * as _ from 'lamb';

import {interpolateColor} from '$lib/config/colors.js';

export const getItemsColorScheme = items => {
	const range = items.length === 1
		? [0]
		: _.range(0, 1, 1 / (items.length - 1)).concat(1);
	const colorScheme = _.map(range, interpolateColor);

	return colorScheme;
}
