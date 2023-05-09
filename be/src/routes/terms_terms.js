import { index, maxBuckets } from '../conf.js';
import { client } from '../es.js';

export const getTermsTerms = async (request, reply) => {
	const {
		field1,
		field2,
		size1 = maxBuckets,
		size2 = maxBuckets,
		missing1 = null,
		missing2 = null
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
