import { index } from './conf.js';
import { client } from './es.js';
import termsTerms from './aggs/terms_terms.json' assert { type: 'json' }

export const routes = (fastify, options, done) => {

	fastify.get('/', async (_, reply) => {
		return reply.send(
			'test'
		);
	});

	fastify.get('/terms_terms', async (request, reply) => {
		const { field1, field2 } = request.query;
		const q = { ...termsTerms };
		q.aggs.agg1.terms.field = field1;
		q.aggs.agg1.aggs.agg2.terms.field = field2;

		const result = await client.search({
			index,
			body: q
		})

		reply.send(result);
	})

	done();
}
