import { buildServer } from './app.js';

const { HOST='localhost' } = process.env;

const start = async () => {
	const server = await buildServer({ logger: true });

	try {
		await server.listen({ host: HOST, port: 3000 });
	} catch (err) {
		server.log.error(err);
		throw new Error(err);
	}
};

start();
