import { index } from '../conf.js';
import { client } from '../es.js';

export const getDateHistogram1Cardinality2 = async (request, reply) => {
	const {
		calendar_interval1 = '1y',
		field1,
		field2,
		missing2 = null,
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			agg1: {
				date_histogram: {
					field: field1,
					calendar_interval: calendar_interval1,
					format: 'yyyy-MM'
				},
				aggs: {
					agg2: {
						cardinality: {
							field: field2,
							...missing2 && { missing: missing2 }
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

	reply.send(result.aggregations);
};
