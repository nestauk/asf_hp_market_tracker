import {
	areAllTruthy,
	areEqual,
	getLength,
	pluckKey,
	trim,
} from '@svizzle/utils';
import * as _ from 'lamb';

export const pluckKeySorted = _.pipe([pluckKey, _.sortWith()]);

export const areAllFalsyWith = accessor => _.every(_.not(accessor));

export const doPairItemsContainSameValues = _.allOf([
	_.pipe([_.mapWith(getLength), _.apply(_.areSame)]),
	_.pipe([
		_.mapWith(_.sortWith([])),
		_.apply(_.zip),
		_.mapWith(areEqual),
		areAllTruthy
	])
]);
