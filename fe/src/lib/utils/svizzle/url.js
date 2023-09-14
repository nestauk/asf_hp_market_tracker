import {isArray, isObject} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';

export const objectToSearchParams = _.pipe([
	_.pairs,
	_.mapWith(_.joinWith('=')),
	_.joinWith('&')
]);

const escapeAmpersand = string => string.replace(/&/gu, '%26');

export const risonifyValues = _.mapValuesWith(
	_.when(
		_.anyOf([isArray, isObject]),
		_.pipe([
			RISON.stringify,
			escapeAmpersand
		])
	)
);
