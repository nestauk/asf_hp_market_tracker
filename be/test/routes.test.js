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

const testRoute = async (route, additionalTests = _.identity) => {
	test(`/${route}`, async tap => {
		const server = await build_();
		tap.teardown(() => server.close());
		const tests = await readDirFiles(`test/api/${route}`, '', JSON.parse);
		for await (const { query, response: expectedResponse } of tests) {
			const response = await server.inject(query);
			tap.equal(response.statusCode, 200, 'returns a 200 status code');
			const result = response.json();
			tap.same(response.json(), expectedResponse, 'returns the expected response body');
			additionalTests(tap, query, result, expectedResponse);
		}
		tap.end();
	});
};

testRoute('terms');
testRoute('terms_terms');

const histogramTests = async (tap, query, result) => {
	const q = query.query;
	const expectedBins = 'missing' in q ? q.bins + 1 : q.bins;
	tap.equal(expectedBins, result.agg1.buckets.length);
};
testRoute('histogram', histogramTests);
