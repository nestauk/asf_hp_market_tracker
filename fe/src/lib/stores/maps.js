import {derived, writable} from 'svelte/store';

import {regionTypeToFeatureNameId} from '$lib/config/map.js';
import {_selection} from '$lib/stores/navigation.js';
import {_currThemeVars} from '$lib/stores/theme.js';


/* zoom */

export const _zoom = writable(0);

/* feature ids */

export const _featureNameId = derived(
	_selection,
	selection => regionTypeToFeatureNameId[selection.regionType]
);

/* style */

const _baseLayers = derived(
	_currThemeVars,
	currThemeVars => [
		{
			id: 'nuts21_0',
			source: 'protomaps',
			'source-layer': 'nuts21_0',
			type: 'fill',
			paint: {
				'fill-color': currThemeVars['--colorMapFillNuts'],
				'fill-outline-color': currThemeVars['--colorBorder'],
			}
		}
	]
);

const _fillLayerPaint = derived(
	_currThemeVars,
	currThemeVars => ({
		'fill-color': [
			'case',
			['!=', ['feature-state', 'fill'], null], ['feature-state', 'fill'],
			currThemeVars['--colorBackground']
		],
		'fill-outline-color': [
			'case',
			['!=', ['feature-state', 'stroke'], null], ['feature-state', 'stroke'],
			currThemeVars['--colorBorderAux']
		],
	})
);
const _fillLayers = derived(
	_fillLayerPaint,
	fillLayerPaint => [
		{
			id: 'country21',
			source: 'protomaps',
			'source-layer': 'country21',
			type: 'fill',
			paint: fillLayerPaint
		},
		{
			id: 'itl21_1',
			source: 'protomaps',
			'source-layer': 'itl21_1',
			type: 'fill',
			paint: fillLayerPaint
		},
		{
			id: 'itl21_2',
			source: 'protomaps',
			'source-layer': 'itl21_2',
			type: 'fill',
			paint: fillLayerPaint
		},
		{
			id: 'itl21_3',
			source: 'protomaps',
			'source-layer': 'itl21_3',
			type: 'fill',
			paint: fillLayerPaint
		},
		{
			id: 'lad21',
			source: 'protomaps',
			'source-layer': 'lad21',
			type: 'fill',
			paint: fillLayerPaint
		},
		// {
		// 	id: 'lsoa11',
		// 	source: 'protomaps',
		// 	'source-layer': 'lsoa11',
		// 	type: 'fill',
		// 	paint: fillLayerPaint
		// },
		// {
		// 	id: 'msoa11',
		// 	source: 'protomaps',
		// 	'source-layer': 'msoa11',
		// 	type: 'fill',
		// 	paint: fillLayerPaint
		// },
	]
);

const _lineLayerPaint = derived(
	_currThemeVars,
	currThemeVars => ({
		'line-width': [
			'case',
			['!=', ['feature-state', 'lineWidth'], null], ['feature-state', 'lineWidth'],
			0
		],
		'line-color': currThemeVars['--colorMapHeroStroke'],
	})
);
const _lineLayers = derived(
	_lineLayerPaint,
	lineLayerPaint => [
		{
			id: 'country21_line',
			source: 'protomaps',
			'source-layer': 'country21',
			type: 'line',
			paint: lineLayerPaint
		},
		{
			id: 'itl21_1_line',
			source: 'protomaps',
			'source-layer': 'itl21_1',
			type: 'line',
			paint: lineLayerPaint
		},
		{
			id: 'itl21_2_line',
			source: 'protomaps',
			'source-layer': 'itl21_2',
			type: 'line',
			paint: lineLayerPaint
		},
		{
			id: 'itl21_3_line',
			source: 'protomaps',
			'source-layer': 'itl21_3',
			type: 'line',
			paint: lineLayerPaint
		},
		{
			id: 'lad21_line',
			source: 'protomaps',
			'source-layer': 'lad21',
			type: 'line',
			paint: lineLayerPaint
		},
		// {
		// 	id: 'lsoa11_line',
		// 	source: 'protomaps',
		// 	'source-layer': 'lsoa11',
		// 	type: 'line',
		// 	paint: lineLayerPaint
		// },
		// {
		// 	id: 'msoa11_line',
		// 	source: 'protomaps',
		// 	'source-layer': 'msoa11',
		// 	type: 'line',
		// 	paint: lineLayerPaint
		// },
	]
);

export const _mapStyle = derived(
	[_baseLayers, _fillLayers, _lineLayers],
	([baseLayers, fillLayers, lineLayers]) => ({
		layers: [
			...baseLayers,
			...fillLayers,
			...lineLayers,
		],
		sources: {
			protomaps: {
				type: 'vector',
				tiles: ['https://d21cr7yltjd5j0.cloudfront.net/nuts21_0_country21_itl21_1_itl21_2_itl21_3_lad21_msoa11_lsoa11/{z}/{x}/{y}.mvt'],
				maxzoom: 14
			}
		},
		version: 8,
	})
);
