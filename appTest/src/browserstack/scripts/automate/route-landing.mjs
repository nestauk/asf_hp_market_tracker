import * as _ from 'lamb';

const routes = [
	'/',
	'/guide',
];

export default async ({driver, target, log}) => {
	const results = [];

	/* eslint-disable no-await-in-loop */
	for (const route of routes) {
		await driver.get(target + route);

		let isFunctionReady = false;
		let isPageLoaded = false;

		isFunctionReady = await driver.executeScript(
			() => Boolean(window.nesta_isLayoutUndefined)
		);
		if (isFunctionReady) {
			isPageLoaded = await driver.executeScript(
				() => !window.nesta_isLayoutUndefined()
			);
		}

		results.push([route, isPageLoaded]);
	}

	const retVal = {
		passed: _.reduce(
			results,
			(previousPassed, result) => previousPassed && result[1]
		),
		notes: _.pipe([
			_.filterWith(result => !result[1]),
			_.mapWith(([route]) => route),
		])(results)
	}
	log(retVal);
	return retVal;
}
