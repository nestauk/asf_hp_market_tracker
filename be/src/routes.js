import { index, maxBuckets } from './conf.js';
import { client } from './es.js';
import { schema as histogramSchema } from './schemas/histogram.js';
import { schema as termsSchema } from './schemas/terms.js';
import { schema as termsTermsSchema } from './schemas/terms_terms.js';
import { getIntervalForBins } from './util.js';

export const routes = (fastify, options, done) => {

	fastify.get('/histogram', histogramSchema, async (request, reply) => {
		const {
			field,
			bins = null,
			missing = null
		} = request.query;

		const interval = await getIntervalForBins(index, field, bins);

		const q = {
			size: 0,
			aggs: {
				agg1: {
					histogram: {
						field,
						interval,
						...missing && { missing }
					}
				}
			}
		};

		const result = await client.search({
			index,
			body: q
		});

		reply.send(result.aggregations);

	});

	fastify.get('/terms', termsSchema, async (request, reply) => {
		const {
			field,
			size = maxBuckets,
			missing = null
		} = request.query;

		const q = {
			size: 0,
			aggs: {
				agg1: {
					terms: {
						field,
						size,
						...missing && { missing }
					}
				}
			}
		};

		const result = await client.search({
			index,
			body: q
		});

		reply.send(result.aggregations);
	});
	fastify.get('/terms_terms', termsTermsSchema, async (request, reply) => {
		const {
			field1,
			field2,
			size1 = maxBuckets,
			size2 = maxBuckets,
			missing1 = null,
			missing2 = null
		} = request.query;

		const q = {
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
			index,
			body: q
		});

		reply.send(result.aggregations);
	});

	done();
};
