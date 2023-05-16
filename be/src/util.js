import { client } from './es.js';

export const getIntervalForBins = async (index, field, bins) => {
	const stats = await client.search({ index, body: { aggs: { stats_: { stats: { field } } } } });
	const { min, max } = stats.aggregations.stats_;
	return Math.max(Math.round((max - min) / (bins - 1)), 1);
};
