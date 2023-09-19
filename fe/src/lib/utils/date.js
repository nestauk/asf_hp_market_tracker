import * as _ from 'lamb';

export const formatDateY2 =
	date => date.getFullYear().toString().slice(2);

export const formatDateY4M2 =
	date => `${date.getFullYear()}-${_.padLeft(1 + date.getMonth(), 0, 2)}`;
