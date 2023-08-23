import { index } from './conf.js';
import { client } from './es.js';

export const getIntervalForBins = async (index, field, bins) => {
	const stats = await client.search({ index, body: { aggs: { stats_: { stats: { field } } } } });
	const { min, max } = stats.aggregations.stats_;
	return Math.max(Math.round((max - min) / (bins - 1)), 1);
};

const first = async size => {

	const { id } = await client.openPointInTime({ index, keep_alive: '1m' });
	const body = { size, sort: ['_doc'], pit: { id, keep_alive: '1m' } };
	const results = await client.search({
		body
	});
	return { results, id };
};

const subsequent = async (size, id, search_after) => {
	const body = {
		size,
		sort: ['_doc'],
		pit: {
			id,
			keep_alive: '1m'
		},
		search_after
	};
	const results = await client.search({
		body
	});
	return results;
};

export async function* scroll(
	{ size = 1000, pages = 'all' } = {}
) {

	// set limit to infinity if all to iterate all results
	const limit = pages === 'all' ? Infinity : pages;
	let { results: next, id } = await first(size);
	for (
		let i = 0;
		i < limit && next.hits && next.hits.hits.length !== 0;
		i++
	) {
		yield next;
		// eslint-disable-next-line no-await-in-loop
		const last = next.hits.hits[next.hits.hits.length - 1];
		next = await subsequent(size, id, last.sort);
	}

	await client.closePointInTime({ id });
}
