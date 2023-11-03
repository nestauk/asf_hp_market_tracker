import {isIterableNotEmpty} from '@svizzle/utils';
import * as _ from 'lamb';

import {allRegionsByType, allRegionTypes, hierarchy} from '$lib/data/regions.js';

export const getDescendantsRegions = ({
	parentRegionsType,
	parentRegionsNames,
	targetRegionType
}) => {
	const startIndex = _.findIndex(allRegionTypes, _.is(parentRegionsType));
	const endIndex = _.findIndex(allRegionTypes, _.is(targetRegionType));
	const typeSequence = _.slice(allRegionTypes, startIndex, endIndex + 1);

	const selectedRegionsByType = {};

	_.forEach(typeSequence, (curType, index) => {
		let curRegionNames;

		if (index === 0) {
			curRegionNames = parentRegionsNames;
		} else {
			const prevType = typeSequence[index - 1];
			const {childrenIdx} = selectedRegionsByType[prevType];
			curRegionNames = _.map(childrenIdx, idx => hierarchy[idx].name);
		}

		const regions = _.filter(
			allRegionsByType[curType],
			region => curRegionNames.includes(region.name)
		);
		const childrenIdx = _.flatMap(regions, _.getKey('childrenIdx'));
		selectedRegionsByType[curType] = {childrenIdx, regions}
	});

	const targetRegions = selectedRegionsByType[targetRegionType].regions;

	return targetRegions;
}

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
