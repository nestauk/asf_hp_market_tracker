import * as _ from 'lamb';

export const formatDate =
	date => `${date.getFullYear()}-${_.padLeft(1 + date.getMonth(), 0, 2)}`;
