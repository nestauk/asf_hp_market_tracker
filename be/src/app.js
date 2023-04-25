import cors from '@fastify/cors';
import fastify from 'fastify';

import { routes } from './routes.js';

export const build = async (opts = {}) => {
	const server = fastify(opts);
	await server.register(cors, { origin: '*' });
	server.register(routes);
	return server;
};
