import fs from 'fs';
import * as _ from 'lamb';
import pa11y from 'pa11y';
import htmlReporter from 'pa11y-reporter-html';
import Queue from 'queue-promise';

import {lighthouseUrls} from '../../../fe/src/lib/config.js';
import {urlBases} from '../config.js';

const themeOverride = process.env?.VITE_THEME_OVERRIDE;
const fileSuffix = themeOverride ? `_${themeOverride}` : '';

const queue = new Queue({
	concurrent: 1
});

queue.on('end', () => {
	console.log('Done!');
});

const auditURL = async (id, url) => {
	const options = {
		standard: 'WCAG2AAA'
	};
	console.log('Auditing', url);
	const runnerResult = await pa11y(
		urlBases.development + url,
		options
	);
	console.log('Auditing done for', url);
	const reportHtml = await htmlReporter.results(runnerResult, url);

	// eslint-disable-next-line no-sync
	fs.writeFileSync(`../fe/static/audits/pa11y/${id}${fileSuffix}.html`, reportHtml);

	// `.lhr` is the Lighthouse Result as a JS object
	console.log(
		'Report is done for',
		runnerResult.pageUrl
	);
	console.log(
		'Issues found:',
		runnerResult.issues.length
	);
}

const enqueueTask = ([id, url]) =>
	queue.enqueue(async () => await auditURL(id, url));

const auditUrls = _.pipe([
	_.pairs,
	_.mapWith(enqueueTask)
]);

auditUrls(lighthouseUrls);
