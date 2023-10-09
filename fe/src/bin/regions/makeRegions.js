#!/usr/bin/env node

import path from 'node:path';

import {tapMessage} from '@svizzle/dev';
import {readDirFilesIndexed, readTsv, saveObj} from '@svizzle/file';
import {
	getId,
	mergeWithMerge,
	renameKeysWith,
	splitByDot,
} from '@svizzle/utils';
import getBBox from '@turf/bbox';
import getCentroid from '@turf/centroid';
import * as _ from 'lamb';

const IN_DIR_PATH_GEOJSONS = '../be/tiles/geojson';
const IN_FILE_PATH_LOOKUP = 'src/bin/regions/regions_lookup.tsv';
const OUT_FILE_PATH_REGIONS = 'src/lib/data/regions.json';

// `country21.geojson` -> `country21`
const fileNameToRegionType = _.pipe([splitByDot, _.head]);

const regionsMetaByRegionType = {
	country21: {
		regionType: 'country21',
		idKey: 'CTRY21CD',
		nameKey: 'CTRY21NM',
	},
	itl21_1: {
		regionType: 'itl21_1',
		idKey: 'ITL121CD',
		nameKey: 'ITL121NM',
	},
	itl21_2: {
		regionType: 'itl21_2',
		idKey: 'ITL221CD',
		nameKey: 'ITL221NM',
	},
	itl21_3: {
		regionType: 'itl21_3',
		idKey: 'ITL321CD',
		nameKey: 'ITL321NM',
	},
	lad21: {
		regionType: 'lad21',
		idKey: 'LAD21CD',
		nameKey: 'LAD21NM',
	},
};

const makeGetRegionDataWith = ({idKey, nameKey}) => _.pipe([
	_.pick([idKey, nameKey]),
	_.rename({
		[idKey]: 'id',
		[nameKey]: 'name',
	})
]);

/*
The expected features' `properties` only contain the id:
{
	"type": "FeatureCollection",
	"features": [
		...,
		{
			...,
			"properties": {
				"CTRY21CD": "W92000004"
			}
		}
	]
}
*/
const getGeometryIndexWith = idKey => _.pipe([
	_.getKey('features'),
	_.mapWith(feature => {
		const id = feature.properties[idKey];
		const bbox = getBBox(feature); // [W, S, E, N]
		const centroid = getCentroid(feature).geometry.coordinates;

		return [id, {bbox, centroid}];
	}),
	_.fromPairs
]);

const processRegions = ([lookup, geojsonByRegionType]) => {
	const augmentRegions = _.mapValuesWith(
		({regionType, idKey, nameKey}) => {
			const getRegionNames = _.pipe([
				_.mapWith(makeGetRegionDataWith({idKey, nameKey})),
				_.indexBy(getId)
			]);
			const regionNames = getRegionNames(lookup);

			const getGeometryIndex = getGeometryIndexWith(idKey);
			const geometryIndex = getGeometryIndex(geojsonByRegionType[regionType]);

			const regions = _.index(
				_.values(mergeWithMerge(geometryIndex, regionNames)),
				_.getKey('name')
			);

			return {
				idKey,
				nameKey,
				regionType,
				regions,
			};
		}
	);
	const regions = augmentRegions(regionsMetaByRegionType)

	return regions;
}

console.log(`\nrun: ${path.basename(import.meta.url)}\n`);

Promise.all([
	readTsv(IN_FILE_PATH_LOOKUP),
	readDirFilesIndexed(IN_DIR_PATH_GEOJSONS, null, JSON.parse)
	.then(renameKeysWith(fileNameToRegionType))
])
.then(processRegions)
.then(saveObj(OUT_FILE_PATH_REGIONS, '\t'))
.then(tapMessage(`Saved to ${OUT_FILE_PATH_REGIONS}`))
.catch(err => console.error(err));
