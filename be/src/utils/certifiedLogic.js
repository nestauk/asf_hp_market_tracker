import * as _ from 'lamb';
import { DateTime, Interval } from 'luxon';

/*
each bucket is an aggregation for a single installer
- date_histogram1 = date_histogram for certificate_date_start
- date_histogram2 = date_histogram for certificate_date_end
*/
export const getValidDateRanges = _.pipe([
	_.mapWith(bucket => [bucket.min.value_as_string, bucket.max.value_as_string]),
	_.filterWith(range => range[0] && range[1])
]);

/*
- interval: ['2000-01', '2010-01']

- logic = 'overlaps' (does `range` overlap `interval`?)
	- range: ['2005-01', '2015-01'] => true
	- range: ['1990-01', '1995-01'] => false

- logic = 'engulfs' (does `range` engulf `interval`?)
	- range: ['1990-01', '2015-01'] => true
	- range: ['2005-01', '2015-01'] => false
*/
const intersectsWithInterval = (range, interval, logic) => {
	const rangeInterval = Interval.fromDateTimes(
		DateTime.fromISO(range[0]), // certified_start
		DateTime.fromISO(range[1]) // certified_end
	);

	let intersects = false;

	switch (logic) {
		case 'overlaps':
			intersects = rangeInterval.overlaps(interval);
			break;
		case 'engulfs':
			intersects = rangeInterval.engulfs(interval);
			break;
		case 'new':
			intersects = rangeInterval.start >= interval.start;
			break;
		case 'dropped':
			intersects = rangeInterval.end <= interval.end;
			break;
		default:
			break;
	}

	return intersects;
};

export const calculateCounts = (window, logic) => _.pipe([
	getValidDateRanges,
	_.reduceWith(
		(count, range) => count + intersectsWithInterval(range, window, logic),
		0
	)
]);

export const roundDateDown = (date, calendar_interval) => {
	let result = date;

	switch (calendar_interval) {
		case '1y':
			result = DateTime.fromISO(`${date.year}`);
			break;
		case '1M':
			result = DateTime.fromISO(`${date.year}-${date.month}-01`);
			break;
		case '1q': {
			const quarter = Math.floor(date.month / 3);
			result = DateTime.fromISO(`${date.year}-${3 * quarter + 1}-01`);
			break;
		}
		default:
			break;
	}

	return result;
};
