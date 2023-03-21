import cors from '@fastify/cors';
import fastify from 'fastify';
import fastifyIO from 'fastify-socket.io';

const start = async () => {
	const server = fastify();

	await server.register(cors, {
		origin: '*'
	});

	await server.register(fastifyIO, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST']
		}
	});

	try {
		await server.listen({ host: 'localhost', port: 3000 });
		server.io.on('connection', socket => {
			socket.on('data', integer => {
				server.io.to(socket.id).emit('result', integer * 2);
			});
		});
	} catch (err) {
		server.log.error(err);
		throw new Error(err);
	}
};

start();
