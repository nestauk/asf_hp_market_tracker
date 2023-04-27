import cors from '@fastify/cors';
import fastify from 'fastify';

import { onRequest, formatPayload } from './hooks.js';
import { routes } from './routes.js';

export const buildServer = async (opts = {}) => {
	const server = fastify(opts);
	await server.register(cors, { origin: '*' });
	server.addHook('onRequest', onRequest);
	server.addHook('preSerialization', formatPayload);
	server.register(routes);
	return server;
};
