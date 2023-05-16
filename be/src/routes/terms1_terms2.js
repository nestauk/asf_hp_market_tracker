import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTerms1Terms2 = async (request, reply) => {
	const {
		field1,
		missing1 = null,
		size1 = maxBuckets,
		field2,
		missing2 = null,
		size2 = maxBuckets,
	} = request.query;

	const body = {
		size: 0,
		aggs: {
			agg1: {
				terms: {
					field: field1,
					size: size1,
					...missing1 && { missing: missing1 }
				},
				aggs: {
					agg2: {
						terms: {
							field: field2,
							size: size2,
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