import { readDir, readJson } from '@svizzle/file';
import { test } from 'tap';

import { testBuild } from '../../src/app.js';

const path = 'test/routes/api';

const testRoute = async route => {
	test(`/${route}`, async t => {
		const server = await testBuild();
		t.teardown(() => server.close());

		const testPath = `${path}/${route}`;
		const tests = await readDir(testPath);

		for await (const testFile of tests) {
			const { query, response: expectedResponse } = await readJson(`${testPath}/${testFile}`);
			const response = await server.inject(query);
			t.equal(response.statusCode, 200, `${route} ${testFile} returns a 200 status code`);
			t.same(response.json(), expectedResponse, `${route} ${testFile} returns the expected response body`);
		}
		t.end();
	});
};

testRoute('terms');
testRoute('terms_terms');

const histogramTests = async (tap, query, result) => {
	const q = query.query;
	const expectedBins = 'missing' in q ? q.bins + 1 : q.bins;
	tap.equal(expectedBins, result.data.agg1.buckets.length);
};
testRoute('histogram', histogramTests);
