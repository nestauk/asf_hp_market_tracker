import { readDirFiles } from '@svizzle/file';
import * as _ from 'lamb';
import { test } from 'tap';

import { build } from '../src/app.js';

const build_ = () => build({
	disableRequestLogging: true,
	logger: {
		level: 'info',
		transport: {
			target: 'pino-pretty'
		}
	}
});

test('/terms_terms', async t => {
	const server = await build_();
	t.teardown(() => server.close());
	const tests = await readDirFiles('test/api/terms_terms', '', JSON.parse);
	for await (const { query, response: expectedResponse } of tests) {
		const response = await server.inject(query);
		t.equal(response.statusCode, 200, 'returns a 200 status code');
		t.same(response.json(), expectedResponse, 'returns the expected response body');
	}
	t.end();
});
