import { DateTime, Interval } from 'luxon';

import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';
import { calculateCounts } from '../utils/certifiedLogic.js';

export const getCertified = async (request, reply) => {
	const {
		logic='overlaps'
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
	const missingEndDate = DateTime.fromISO(maxEndDate).toMillis();

	const body = {
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
							missing: missingEndDate
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

	const timelineWindow = Interval.fromDateTimes(
		DateTime.fromISO(start),
		DateTime.fromISO(end)
	);

	const calculate = calculateCounts(timelineWindow, logic);
	const count = calculate(result.aggregations.terms.buckets);

	const response = { count };
	reply.send(response);
};
