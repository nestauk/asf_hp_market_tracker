import { readDirFiles } from '@svizzle/file';
import rison from 'rison';
import { test } from 'tap';

import { buildTestServer } from '../utils.js';
import { index } from '../../src/conf.js';
import { client } from '../../src/es.js';
import { makeQuery } from '../../src/filter.js';

const buildQuery = request => {
	return {
		method: 'GET',
		url: 'terms',
		query: {
			filter: rison.encode(request),
			field: 'property_geo_region_country.keyword'
		}
	};
};

test('#makeQuery', async tap => {
	const server = await buildTestServer();
	tap.teardown(() => server.close());
	const tests = await readDirFiles('test/filter/requests', '', JSON.parse);
	for await (const { request, query } of tests) {
		const q = makeQuery(request);
		tap.same(q, query, 'generated query and expected query should be the same');
		const response = await client.search({ index, body: q }, { meta: true });
		tap.equal(response.statusCode, 200, 'ES should return a 200 status code');
		const beResponse = await server.inject(buildQuery(request));
		tap.equal(beResponse.statusCode, 200, 'BE should return a 200 status code');

	}
	tap.end();
});
