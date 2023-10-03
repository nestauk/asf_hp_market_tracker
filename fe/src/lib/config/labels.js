import {capitalize} from '@svizzle/utils';
import * as _ from 'lamb';

export const intervalToAxisLabel = {
	'1M': 'monthly',
	'1q': 'quarterly',
	'1y': 'yearly',
}

export const intervalToLabel = _.mapValues(intervalToAxisLabel, capitalize);

export const regionTypeToLabel = {
	country21: 'Country',
	itl21_1: 'ITL 1',
	itl21_2: 'ITL 2',
	itl21_3: 'ITL 3',
	lad21: 'LAD',
}

export const uiTooltips = {
	/* regionType */

	regionType_country21: 'UK Country (2021)',
	regionType_itl21_1: 'International Territorial Level 1  (2021)',
	regionType_itl21_2: 'International Territorial Level 2 (2021)',
	regionType_itl21_3: 'International Territorial Level 3 (2021)',
	regionType_lad21: 'Local Authority District (2021)',

	/* stringsGeoSortBy */

	stringsGeoSortBy_total: 'Sort by the total value of each group',
	stringsGeoSortBy_regionName: 'Sort by region name',

	/* stackedBarsExtents */

	stackedBarsExtents_absolute: 'Show absolute values',
	stackedBarsExtents_percent: 'Show percent values, to compare values to the total of its group',

	/* stringsTimeGraph */

	stringsTimeGraph_trends: 'For each group, show a curve of its value over time',
	stringsTimeGraph_streams: 'For each group, show the contribution of its value to the total over time',
	stringsStreamgraphsSorting_off: 'Don\'t sort groups',
	stringsStreamgraphsSorting_asc: 'Sort groups in ascending order',
	stringsStreamgraphsSorting_desc: 'Sort groups in descending order',

	/* categsTimeGraph */

	categsTimeGraph_trends: 'For each category, show a curve of its value over time',
	categsTimeGraph_streams: 'For each category, show the contribution of its value to the total over time',
	categsStreamgraphsSorting_off: 'Don\'t sort categories',
	categsStreamgraphsSorting_asc: 'Sort categories in ascending order',
	categsStreamgraphsSorting_desc: 'Sort categories in descending order',

	/* trendType */

	trendType_progressive: 'Show the value in time',
	trendType_cumulative: 'Show the cumulative value in time, summing it up to the previous value',

	/* numTimeGraph */

	numTimeGraph_percentiles: 'Show percentiles over time',
	numTimeGraph_average: 'Show the trend of the average value',
}
