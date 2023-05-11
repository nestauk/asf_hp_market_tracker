import * as _ from 'lamb';

import { index } from './conf.js';
import { client, getDocumentCount } from './es.js';

export const getIntervalForBins = async (field, bins) => {
	const stats = await client.search({ index, body: { aggs: { stats_: { stats: { field } } } } });
	const { min, max } = stats.aggregations.stats_;
	return Math.max(Math.round((max - min) / (bins - 1)), 1);
};

export const calculateCoverage = async (filter, field1, field2) => {

	// 100 docs
	// 50 docs have design prop
	// no filter: coverage is 50%
	// apply filter -> 40 docs returned
	// 40/100, 40/50, 

	// Number of retrievable documents: 50 docs -> 50% of all data points
	// Number of documents after filtering: 40 docs

	const retrieveFilter = [
		{ exists: { field: field1 } },
		...(field2 ? [{ exists: { field: field2 } }] : [])
	]

	const retreivableQuery = {
		query: {
			bool: { filter: retrieveFilter }
		}
	}
	const filteredQuery = {
		query: {
			bool: { filter: [...filter, ...retrieveFilter] }
		}
	}

	const retreivable = await getDocumentCount(retreivableQuery);
	const filtered = await getDocumentCount(filteredQuery);
	const coverage = {
		retreivable,
		filtered
	}
	return coverage;
};
