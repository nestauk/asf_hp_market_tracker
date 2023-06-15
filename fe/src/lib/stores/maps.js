import {derived, writable} from 'svelte/store';

import {
	DEFAULT_BBOX_WS_EN,
	regionTypeToFeatureNameId
} from '$lib/config/map.js';
import {_selection} from '$lib/stores/navigation.js';
import {_currThemeVars} from '$lib/stores/theme.js';


/* bounding box, zoom */

export const _bbox_WS_EN = writable(DEFAULT_BBOX_WS_EN);
export const _bbox_WSEN = derived(
	_bbox_WS_EN,
	([[w, s], [e, n]]) => [w, s, e, n]
);

export const _zoom = writable(0);

/* feature ids */

export const _featureNameId = derived(
	_selection,
	selection => regionTypeToFeatureNameId[selection.regionType]
);

/* style */

export const _baseLayers = derived(
	_currThemeVars,
	currThemeVars => [
		{
			id: 'nuts21_0',
			source: 'protomaps',
			'source-layer': 'nuts21_0',
			type: 'fill',
			paint: {
				'fill-color': currThemeVars['--colorBackground'],
				'fill-outline-color': currThemeVars['--colorBorder'],
			}
		}
	]
);

const _defaultLayerPaint = derived(
	_currThemeVars,
	currThemeVars => ({
		'fill-color': [
			'case',
			['!=', ['feature-state', 'fill'], null], ['feature-state', 'fill'],
			currThemeVars['--colorBackground']
		],
		'fill-outline-color': currThemeVars['--colorBorderAux']
	})
);
export const _regionLayers = derived(
	_defaultLayerPaint,
	defaultLayerPaint => [
		{
			id: 'country21',
			source: 'protomaps',
			'source-layer': 'country21',
			type: 'fill',
			paint: defaultLayerPaint	
		},
		{
			id: 'itl21_1',
			source: 'protomaps',
			'source-layer': 'itl21_1',
			type: 'fill',
			paint: defaultLayerPaint
		},
		{
			id: 'itl21_2',
			source: 'protomaps',
			'source-layer': 'itl21_2',
			type: 'fill',
			paint: defaultLayerPaint
		},
		{
			id: 'itl21_3',
			source: 'protomaps',
			'source-layer': 'itl21_3',
			type: 'fill',
			paint: defaultLayerPaint
		},
		{
			id: 'lad21',
			source: 'protomaps',
			'source-layer': 'lad21',
			type: 'fill',
			paint: defaultLayerPaint
		},
		{
			id: 'lsoa11',
			source: 'protomaps',
			'source-layer': 'lsoa11',
			type: 'fill',
			paint: defaultLayerPaint
		},
		{
			id: 'msoa11',
			source: 'protomaps',
			'source-layer': 'msoa11',
			type: 'fill',
			paint: defaultLayerPaint
		},
	]
);

export const _mapStyle = derived(
	[_baseLayers, _regionLayers],
	([baseLayers, regionLayers]) => ({
		version: 8,
		layers: [
			...baseLayers,
			...regionLayers
		],
		// sources
		sources: {
			protomaps: {
				type: 'vector',
				tiles: ['https://d21cr7yltjd5j0.cloudfront.net/nuts21_0_country21_itl21_1_itl21_2_itl21_3_lad21_msoa11_lsoa11/{z}/{x}/{y}.mvt']
			}
		}
	})
);