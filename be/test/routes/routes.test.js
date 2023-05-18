import { readDir, readJson } from '@svizzle/file';
import { test } from 'tap';

import { buildTestServer } from '../utils.js';

const path = 'test/routes/api';

const testRoute = async route => {
	test(`/${route}`, async t => {
		const server = await buildTestServer();
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

const histogramTests = async (tap, query, result) => {
	const q = query.query;
	const expectedBins = 'missing' in q ? q.bins + 1 : q.bins;
	tap.equal(expectedBins, result.data.agg1.buckets.length);
};

testRoute('cardinality');
testRoute('date_histogram');
testRoute('date_histogram1_cardinality2');
testRoute('date_histogram1_terms2');
testRoute('date_histogram1_stats2');
testRoute('date_histogram1_histogram2');
testRoute('histogram', histogramTests);
testRoute('terms');
testRoute('terms1_cardinality2');
testRoute('terms1_histogram2');
testRoute('terms1_terms2');
testRoute('terms1_stats2');
