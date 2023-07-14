import {isArray, isObject} from '@svizzle/utils';
import * as _ from 'lamb';
import {RISON} from 'rison2';

export const risonifyValues = _.mapValuesWith(
	_.when(_.anyOf([isArray, isObject]), RISON.stringify)
);
