
import { readDir, readJson, saveObj } from '@svizzle/file';
import * as _ from 'lamb';

import { buildServer } from '../app.js';

const path = 'test/routes/api';

const updateRoute = async route => {

	const server = await buildServer();

	const testPath = `${path}/${route}`;
	const tests = await readDir(testPath);

	for await (const testFile of tests) {
		const { query } = await readJson(`${testPath}/${testFile}`);
		const response = await server.inject(query);
		const save = saveObj(`${testPath}/${testFile}`, '\t');
		save({ query, response: response.json() });
	}
};

const main = async () => {
	const routes = await readDir(path);
	_.forEach(routes, updateRoute);
};

main();
