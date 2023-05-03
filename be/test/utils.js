import { buildServer } from '../src/app.js';

export const buildTestServer = () => buildServer({
	disableRequestLogging: true,
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty'
		}
	}
});
