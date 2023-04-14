export const routes = (fastify, options, done) => {

	fastify.get('/', async (_, reply) => {
		return reply.send(
			'test'
		);
	});

	done();
}
