import { index } from './conf.js';
import { client } from './es.js';
import { schema as termsTermsSchema } from './schemas/terms_terms.js';

export const routes = (fastify, options, done) => {

	fastify.get('/', async (_, reply) => {
		return reply.send(
			'test'
		);
	});

	fastify.get('/terms_terms', termsTermsSchema, async (request, reply) => {
		const {
			field1,
			field2,
			size1 = 1000000,
			size2 = 1000000,
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
