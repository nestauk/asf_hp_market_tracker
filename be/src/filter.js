import {getId} from '@svizzle/utils';
import * as _ from 'lamb';

import {fields} from 'nesta_hpmt_shared/fields.js';

const schema = _.index(fields, getId);

export const makeQuery = filterRequest => {
	const filter = _.reduce(
		_.pairs(filterRequest),
		(acc, [key, value]) => [
			...acc,
			{
				[schema[key].esType]: {
					[schema[key].esKey || key]: value
				}
			}
		],
		[]
	);

	return { query: { bool: { filter } } };
};
