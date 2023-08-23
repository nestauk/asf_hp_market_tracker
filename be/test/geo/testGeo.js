import { promises as fs } from 'fs';

import { saveObj } from '@svizzle/file';
import * as _ from 'lamb';

import { scroll } from '../../src/util.js';

const geoProperties = [
	'geo_region_itl21_1',
	'geo_region_itl21_2',
	'geo_region_itl21_3',
	'geo_region_lau21_1',
	'geo_region_lsoa11',
	'geo_region_msoa11',
];

const nameToIdMap = {};
_.forEach(
	geoProperties,
	property => {
		nameToIdMap[property] = {};
	}
);

const mapGeoProperties = (doc, _type) => {
	_.forEach(
		geoProperties,
		property => {
			const key = doc[`${_type}_${property}_id`];
			const value = doc[`${_type}_${property}_name`];
			const _map = nameToIdMap[property];
			if (key && value) {
				if (value in _map) {
					if (!_map[value].keys.includes(key)) {
						_map[value].keys.push(key);
					}
					_map[value].count += 1;
				} else {
					_map[value] = {};
					_map[value].keys = [key];
					_map[value].count = 1;
				}
			}
		}
	);
};
const collect = async () => {
	const scroller = scroll();
	for await (const page of scroller) {
		_.map(
			page.hits.hits,
			document => {
				mapGeoProperties(document._source, 'installer');
				mapGeoProperties(document._source, 'property');
			}
		);
	}
	const save = saveObj('./test/geo/nameToIdMap.json', '\t');
	save(nameToIdMap);
};

const check = async () => {
	const _map = JSON.parse(await fs.readFile('./test/geo/nameToIdMap.json'));
	let sum = 0;
	_.forEach(
		geoProperties,
		property => {
			_.forEach(
				_.pairs(_map[property]),
				([key, value]) => {
					if (value.keys.length > 1) {
						console.log(property, key, value);
						sum += value.count;
					}
				}
			);
		}
	);
	console.log(sum);
};

// collect();
// check();
