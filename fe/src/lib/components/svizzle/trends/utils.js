import * as _ from 'lamb';

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = 28 * DAY; // shortest month
const YEAR = 365 * DAY; // shortest year

const formatOptions = [
	[YEAR, {year: '2-digit'}],
	[MONTH, {year: '2-digit', month: '2-digit'}],
	[DAY, {year: '2-digit', month: '2-digit', day: '2-digit'}],
];

const timeFormats = _.map(
	formatOptions,
	([maxSeconds, options]) => [
		maxSeconds,
		new Intl.DateTimeFormat('fr-CA', options).format // fr-CA -> yy-mm-dd
	]
);

export const getDateTimeFormat = tickDurationInSecs => _.find(
	timeFormats,
	([maxSeconds]) => tickDurationInSecs >= maxSeconds
)[1];
