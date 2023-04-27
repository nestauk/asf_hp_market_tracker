import { buildServer } from './app.js';

const start = async () => {
	const server = await buildServer({ logger: true });

	try {
		await server.listen({ host: 'localhost', port: 3000 });
	} catch (err) {
		server.log.error(err);
		throw new Error(err);
	}
};

start();
