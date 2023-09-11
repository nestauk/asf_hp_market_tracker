import * as _ from 'lamb';

import { schema } from './schemas/filter.js';

export const makeQuery = filterRequest => {
	const filter = _.reduce(
		_.pairs(filterRequest),
		(acc, [k, v]) => [
			...acc,
			{ [schema[k].type]: { [schema[k].name || k]: v } }],
		[]
	);

	return { query: { bool: { filter } } };
};
