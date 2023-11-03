import {isIterableEmpty} from '@svizzle/utils';
import * as _ from 'lamb';
import {derived} from 'svelte/store';

import {allRegionsByNameByType} from '$lib/data/regions.js';
import {_currentMetric, _selection} from '$lib/stores/navigation.js';
import {getName} from '$lib/utils/getters.js';
import {getDescendantsRegions} from '$lib/utils/regions.js';

export const _selectedRegionNamesIndex = derived(
	[_currentMetric, _selection],
	([currentMetric, {filters, regionType}]) => {
		const {geoPrefix} = currentMetric;
		const parentRegionsNames = filters[`${geoPrefix}RegionNames`];

		let regionsByName;
		if (isIterableEmpty(parentRegionsNames)) {
			regionsByName = allRegionsByNameByType[regionType];
		} else {
			const selectedRegions = getDescendantsRegions({
				parentRegionsType: filters[`${geoPrefix}RegionType`],
				parentRegionsNames,
				targetRegionType: regionType
			});
			regionsByName = _.index(selectedRegions, getName);
		}

		return regionsByName;
	}
);
