import {getId} from '@svizzle/utils';
import * as _ from 'lamb';

import {fields} from 'nesta_hpmt_shared/fields.js';

const schema = _.index(fields, getId);

export const makeQuery = _.pipe([
	_.pairs,
	_.mapWith(([key, value]) => ({
			[schema[key].esType]: {
				[schema[key].esKey || key]: value
			}
		})
	)
]);

const clauseToFilter = {
	include: 'should',
	exclude: 'must_not'
}
export const makeQueryFromStringsFilters = _.pipe([
	_.mapWith(({clause, field, values}) => ({
		bool: {
			[clauseToFilter[clause]]: _.map(values, value => ({
				wildcard: {
					[field]: {
						value: `*${value}*`,
						case_insensitive: true
					}
				}
			}))	
		}
	}))
]);
