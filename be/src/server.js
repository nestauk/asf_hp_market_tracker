import cors from '@fastify/cors';
import fastify from 'fastify';

import { routes } from './routes.js';

const start = async () => {
	const server = fastify();

	await server.register(cors, {
		origin: '*'
	});

	server.register(routes);

	try {
		await server.listen({ host: 'localhost', port: 3000 });
	} catch (err) {
		server.log.error(err);
		throw new Error(err);
	}
};

start();
