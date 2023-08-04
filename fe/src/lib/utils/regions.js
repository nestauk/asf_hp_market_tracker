import {isIterableNotEmpty} from '@svizzle/utils';
import * as _ from 'lamb';

// TBD, could be derived from `fe/src/lib/data/regions.json`
export const allRegionTypes = [
	'country21',
	'itl21_1',
	'itl21_2',
	'itl21_3',
	'lad21',
	// 'lsoa11',
	// 'msoa11',
];

export const getRegionsSelection = ({currentMetric, filters, regionType}) => {
	const {geoPrefix} = currentMetric;
	const metricRegionType = filters[`${geoPrefix}RegionType`];
	const metricRegionNames = filters[`${geoPrefix}RegionNames`];

	let regionTypes = allRegionTypes;
	if (isIterableNotEmpty(metricRegionNames)) {
		const index = _.findIndex(allRegionTypes, _.is(metricRegionType));
		regionTypes = _.dropFrom(allRegionTypes, index);
	}

	const newRegionType = _.isIn(regionTypes, regionType)
		? regionType
		: regionTypes[0];

	return {
		regionType: newRegionType,
		regionTypes
	}
}
