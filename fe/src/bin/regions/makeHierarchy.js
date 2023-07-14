#!/usr/bin/env node

import path from 'node:path';

import {tapMessage} from '@svizzle/dev';
import {readTsv, saveObj} from '@svizzle/file';
import {getId} from '@svizzle/utils';
import * as _ from 'lamb';

const IN_FILE_PATH_LOOKUP = 'src/bin/regions/regions_lookup.tsv';
const OUT_FILE_PATH_HIERARCHY = 'src/lib/data/hierarchy.json';

const getIdx = _.getKey('idx');
const getParentId = _.getKey('parentId');
const getRegionLinkId = ({id, level, parentId}) => `${level}-${id}-${parentId}`;

// [1]
const makeHierarchy = _.pipe([
	_.flatMapWith(({
		CTRY21CD,
		CTRY21NM,
		ITL121CD,
		ITL121NM,
		ITL221CD,
		ITL221NM,
		ITL321CD,
		ITL321NM,
		LAD21CD,
		LAD21NM,
	}) => [
		{
			id: LAD21CD,
			level: 4,
			name: LAD21NM,
			parentId: ITL321CD,
			parentName: ITL321NM,
			rootId: CTRY21CD,
			rootName: CTRY21NM,
			type: 'lad21',
		},
		{
			id: ITL321CD,
			level: 3,
			name: ITL321NM,
			parentId: ITL221CD,
			parentName: ITL221NM,
			rootId: CTRY21CD,
			rootName: CTRY21NM,
			type: 'itl21_3',
		},
		{
			id: ITL221CD,
			level: 2,
			name: ITL221NM,
			parentId: ITL121CD,
			parentName: ITL121NM,
			rootId: CTRY21CD,
			rootName: CTRY21NM,
			type: 'itl21_2',
		},
		{
			id: ITL121CD,
			level: 1,
			name: ITL121NM,
			parentId: CTRY21CD,
			parentName: CTRY21NM,
			rootId: CTRY21CD,
			rootName: CTRY21NM,
			type: 'itl21_1',
		},
		{
			id: CTRY21CD,
			level: 0,
			name: CTRY21NM,
			parentId: null,
			parentName: null,
			rootId: CTRY21CD,
			rootName: CTRY21NM,
			type: 'country21',
		},
	]),
	_.uniquesBy(getRegionLinkId),
	_.sortWith([getRegionLinkId]),
	_.zipWithIndex,
	_.mapWith(([region, idx]) => ({...region, idx})),
	_.collect([
		_.groupBy(getParentId),
		_.indexBy(getId),
		_.indexBy(getIdx),
	]),
	([regionsByParentId, regionById, regionByIdx]) =>
		_.mapValues(regionByIdx, region => {
			const childrenIdx = regionsByParentId[region.id] // is it a parent?
				? _.map(regionsByParentId[region.id], getIdx)
				: undefined;
			const parentIdx = region.parentId	// does it have a parent?
				? getIdx(regionById[region.parentId])
				: null;

			return {
				...region,
				childrenIdx,
				parentIdx,
			}
		})
]);

console.log(`\nrun: ${path.basename(import.meta.url)}\n`);

readTsv(IN_FILE_PATH_LOOKUP)
.then(makeHierarchy)
.then(saveObj(OUT_FILE_PATH_HIERARCHY, '\t'))
.then(tapMessage(`Saved to ${OUT_FILE_PATH_HIERARCHY}`))
.catch(err => console.error(err));

/* [1]

{
	CTRY21CD: 'E92000001'
	CTRY21NM: 'England',
	ITL121CD: 'TLF',
	ITL121NM: 'East Midlands (England)',
	ITL221CD: 'TLF2',
	ITL221NM: 'Leicestershire, Rutland and Northamptonshire',
	ITL321CD: 'TLF25',
	ITL321NM: 'North Northamptonshire',
	LAD21CD: 'E06000061',
	LAD21NM: 'North Northamptonshire',
}[]

*/
