
import { readDir, readJson, saveObj } from '@svizzle/file';
import * as _ from 'lamb';

import { build } from '../src/app.js';

const update = async route => {

	const server = await build();

	const path = `test/api/${route}`;
	const tests = await readDir(path);

	for await (const testFile of tests) {
		const { query } = await readJson(`${path}/${testFile}`);
		const response = await server.inject(query);
		const save = saveObj(`${path}/${testFile}`, 4);
		save({ query, response: response.json() });
	}
};

const main = async () => {
	const routes = await readDir('test/api');
	_.forEach(routes, route => update(route));
};

main();
