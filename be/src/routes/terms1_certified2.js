import * as _ from 'lamb';
import { DateTime, Interval } from 'luxon';

import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';
import { calculateCounts } from '../utils/certifiedLogic.js';

export const getTerms1Certified2 = async (request, reply) => {
	const {
		field1,
		logic2='overlaps'
	} = request.query;

	const maxMinDateResponse = await client.search({
		body: {
			aggs: {
				max: { max: { field: 'installer_certificate_date_end'} },
				min: { min: { field: 'installer_certificate_date_start' } }
			}
		},
		index
	});
	const maxEndDate = maxMinDateResponse.aggregations.max.value_as_string;
	const minStartDate = maxMinDateResponse.aggregations.min.value_as_string;

	const start =
		request.originalFilter.installer_certificate_date_start?.gte || minStartDate;
	const end =
		request.originalFilter.installer_certificate_date_end?.lte || maxEndDate;
	const missingEndDate = maxEndDate;

	const body = {
		size: 0,
		aggs: {
			terms: {
				terms: {
					field: field1,
					size: maxBuckets,
				},
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
									missing: missingEndDate
								}
							}
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

	const interval = Interval.fromDateTimes(
		DateTime.fromISO(start),
		DateTime.fromISO(end)
	);

	const calculate = calculateCounts(interval, logic2);

	const counts = _.reduce(
		result.aggregations.terms.buckets,
		(acc, bucket) => ({...acc,
			[bucket.key]: calculate(bucket.terms.buckets)}
		),
		{}
	);

	const formattedResponse = _.map(
		_.pairs(counts),
		([term, count]) => ({
			key: term,
			certified: {
				value: count
			}
		})
	);

	const response = { terms: { buckets: formattedResponse } };
	reply.send(response);
};
