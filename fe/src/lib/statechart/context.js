import {allRegionTypes} from '$lib/utils/regions.js';

export const context = {
	nextSearchParams: '',
	nextSelection: {},
	selection: {
		categsGeoSortBy: 'total',
		categsStreamgraphsSorting: 'off',
		categsTimeGraph: 'trends',
		filters: {
			installerRegionNames: [],
			installerRegionType: 'country21',
			propertyRegionNames: [],
			propertyRegionType: 'country21',
		},
		interval: '1y',
		numTimeGraph: 'percentiles',
		regionType: 'country21',
		regionTypes: allRegionTypes,
		stackedBarsExtents: 'absolute',
		stringsGeoSortBy: 'total',
		stringsStreamgraphsSorting: 'off',
		stringsTimeGraph: 'trends',
		stringsTopCount: 20,
		trendType: 'progressive',
		viewId: '',
	},
	viewQueryPath: '',
};
