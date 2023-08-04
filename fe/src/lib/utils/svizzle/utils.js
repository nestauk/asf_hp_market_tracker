import {areAllTruthy, getLength, getKey, isNotNil} from '@svizzle/utils';
import * as _ from 'lamb';

/**
* @module @svizzle/utils/number-[number-number]
*/

/**
 * Return a function that rounds the input number to the provided number of digits.
 * @see https://github.com/d3/d3-path/issues/10#issuecomment-262577521
 *
 * @function
 * @arg {number} precision - Must be an integer
 * @return {function} - Number -> Number
 *
 * @example
> roundTo2 = roundTo(2)
> roundTo2(2.41285)
2.41
> roundTo2(2.41785)
2.42
 * @since 0.6.0
 */
export const roundTo = precision => x => Number(x?.toFixed(precision));


/**
* @module @svizzle/utils/iterable-object
*/

/**
 * Return the {key, values} object from a pair
 *
 * @function
 * @arg {iterable} iterable
 * @return {object}
 *
 * @example
> function func () {
	return pairToKeyValuesObject(arguments);
}
> func()
{key: undefined, values: undefined}
> func(1)
{key: 1, values: undefined}
> func(1, [2, 3])
{key: 1, values: [2, 3]}
> func(1, [2, 3])
{key: 1, values: [2, 3]}
> pairToKeyValuesObject([])
{key: 'undefined', values: 'undefined'}
> pairToKeyValuesObject([1])
{key: 1, values: undefined}
> pairToKeyValuesObject([1, [2, 3]])
{key: 1, values: [2, 3]}
> pairToKeyValuesObject([1, [2, 3], 4])
{key: 1, values: [2, 3]}
> pairToKeyValuesObject('')
{key: 'undefined', values: 'undefined'}
> pairToKeyValuesObject('a')
{key: 'a', values: 'undefined'}
> pairToKeyValuesObject('ab')
{key: 'a', values: 'b'}
> pairToKeyValuesObject('abc')
{key: 'a', values: 'b'}
 *
 * @since 0.20.0
 */
export const pairToKeyValuesObject = ([key, values]) => ({key, values});


/**
* @module @svizzle/utils/object-array
*/

/**
 * Return an array of {key, value} objects from an object
 *
 * @function
 * @arg {object} object
 * @return {array}
 *
 * @example
> obj = {k1: ['a', 'b'], k2: ['c', 'd']}
> objectToKeyValuesArray(obj)
[{key: 'k1', values: ['a', 'b']}, {key: 'k2', values: ['c', 'd']}]
 *
 * @since 0.20.0
 */
export const objectToKeyValuesArray = _.pipe([
	_.pairs,
	_.mapWith(pairToKeyValuesObject)
]);

export const pluckKey = _.mapWith(getKey);

export const pluckKeySorted = _.pipe([pluckKey, _.sortWith()]);

export const areAllFalsyWith = accessor => _.every(_.not(accessor));

export const doPairItemsContainSameValues = _.allOf([
	_.pipe([_.mapWith(getLength), _.apply(_.areSame)]),
	_.pipe([
		_.mapWith(_.sortWith()),
		_.apply(_.zip),
		_.mapWith(_.apply(_.areSame)), // use `just-compare` to make it generic
		areAllTruthy
	])
]);

export const hasKeyWith = predicate => _.pipe([
	_.pairs,
	_.findWhere(_.pipe([_.head, predicate])),
	isNotNil
]);

export const pickIfKeyWith = predicate => _.pipe([
	_.pairs,
	_.filterWith(_.pipe([_.head, predicate])),
	_.fromPairs
]); // now unused here but quite useful

export const skipIfKeyWith = predicate => _.pipe([
	_.pairs,
	_.filterWith(_.pipe([_.head, _.not(predicate)])),
	_.fromPairs
]); // now unused here but quite useful


/**
* @module @svizzle/utils/string-string
*/

/**
 * Decapitalise the input string (makes the first letter lowercase)
 *
 * @function
 * @arg {string}
 * @return {string}
 *
 * @example
> decapitalize('HAha')
'hAha'
 *
 * @since 0.20.0
 */
export const decapitalize = s => s.charAt(0).toLowerCase() + s.slice(1);
