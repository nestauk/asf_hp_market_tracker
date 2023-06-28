import { getKey } from '@svizzle/utils';
import * as _ from 'lamb';
import { DateTime } from 'luxon';

import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';
import { getValidDateRanges, roundDateDown } from '../utils/certifiedLogic.js';

export const getDateHistogram1Certified2 = async (request, reply) => {
	const {
		calendar_interval1 = '1y',
	} = request.query;

	const maxEndDateResponse = await client.search({
		body: {
			aggs: {
				max: {
					max: {
						field: 'installer_certificate_date_end'
					}
				}
			}
		},
		index
	});
	const maxEndDate = maxEndDateResponse.aggregations.max.value_as_string;

	const body = {
		...request.filter,
		size: 0,
		aggs: {
			terms: {
				terms: {
					field: 'installer_id_hash.keyword',
					size: maxBuckets
				},
				aggs: {
					min: {
						min: {
							field: 'installer_certificate_date_start'
						}
					},
					max: {
						max: {
							field: 'installer_certificate_date_end',
							missing: maxEndDate
						}
					}
				}
			}
		}
	};

	const result = await client.search({
		body,
		index
	});

	const dateRanges = getValidDateRanges(result.aggregations.terms.buckets);

	const increment = {
		'1y': { years: 1 },
		'1q': { months: 3 },
		'1M': { months: 1}
	}[calendar_interval1];

	const bins = {};
	_.forEach(
		dateRanges,
		range => {
			let curr = roundDateDown(DateTime.fromISO(range[0]), calendar_interval1);
			const end = DateTime.fromISO(range[1]);
			while (curr < end) {
				const d = curr.toFormat('yyyy-LL-dd');
				if (d in bins) {
					bins[d] += 1;
				} else {
					bins[d] = 1;
				}
				curr = curr.plus(increment);
			}
		}
	);

	const formattedResponse = _.map(
		_.pairs(bins),
		([date, count]) => ({
			certified: {
				value: count
			},
			key_as_string: DateTime.fromISO(date).toFormat('yyyy-LL-dd'),
			key: DateTime.fromISO(date).toMillis(),
		})
	);

	const sortBuckets = _.sortWith([getKey]);
	const response = {
		date_histogram: { buckets: sortBuckets(formattedResponse) }
	};

	reply.send(response);
};
