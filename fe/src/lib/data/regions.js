import * as _ from 'lamb';

// FIXME can't assert json in svelte files
// this module might soon not be needed as it seems it will included in Vite 5:
// https://github.com/vitejs/vite/issues/4934
// https://github.com/vitejs/vite/blob/v5.0.0-beta.14/packages/vite/CHANGELOG.md#500-beta2-2023-09-15
import hierarchyJson from '$lib/data/hierarchy.json' assert {type: 'json'};
import regionsByTypeJson from '$lib/data/regions.json' assert {type: 'json'};
import {getName} from '$lib/utils/getters.js';

export const hierarchy = hierarchyJson;
export const regionsByType = regionsByTypeJson;

// could be derived from `regionsByType`
export const allRegionTypes = [
	'country21',
	'itl21_1',
	'itl21_2',
	'itl21_3',
	'lad21',
	// 'lsoa11',
	// 'msoa11',
];

export const allRegionsByType = _.group(_.values(hierarchy), _.getKey('type'));
export const allRegionsByNameByType =
	_.mapValues(allRegionsByType, _.indexBy(getName));
