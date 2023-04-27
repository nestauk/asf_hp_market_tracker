import cors from '@fastify/cors';
import fastify from 'fastify';

import { onRequest, formatPayload } from './hooks.js';
import { routes } from './routes.js';

export const build = async (opts = {}) => {
	const server = fastify(opts);
	await server.register(cors, { origin: '*' });
	server.addHook('onRequest', onRequest);
	server.addHook('preSerialization', formatPayload);
	server.register(routes);
	return server;
};

export const testBuild = () => build({
	disableRequestLogging: true,
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty'
		}
	}
});
