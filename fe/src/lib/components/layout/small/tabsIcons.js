import {
	BarChart,
	BarChart2,
	Filter,
	Info,
	Layout,
	List,
	MapPin,
	PieChart,
	Sliders,
	TrendingUp,
} from '@svizzle/ui';

import Legend from '$lib/components/svizzle/ui/glyphs/Legend.svelte';

const tabsByRoute = {
	'category/geo': [
		{
			glyph: MapPin,
			id: 'map',
			transform: '',
		},
		{
			glyph: BarChart,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
	],
	'category/stats': [
		{
			glyph: Layout,
			id: 'stats',
			transform: '',
		},
		{
			glyph: BarChart,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
	],
	'category/time': [
		{
			glyph: TrendingUp,
			id: 'trends',
			transform: '',
		},
		{
			glyph: Legend,
			id: 'legend',
			transform: '',
		},
	],
	'count/geo': [
		{
			glyph: MapPin,
			id: 'map',
			transform: '',
		},
		{
			glyph: BarChart,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
	],
	'count/stats': [
		{
			glyph: PieChart,
			id: 'stats',
			transform: '',
		},
	],
	'count/time': [
		{
			glyph: TrendingUp,
			id: 'trends',
			transform: '',
		},
	],
	'number/geo': [
		{
			glyph: MapPin,
			id: 'map',
			transform: '',
		},
		{
			glyph: BarChart,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
	],
	'number/stats': [
		{
			glyph: Layout,
			id: 'stats',
			transform: '',
		},
		{
			glyph: BarChart2,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
	],
	'number/time': [
		{
			glyph: TrendingUp,
			id: 'trends',
			transform: '',
		},
	],
	'string/geo': [
		{
			glyph: Legend,
			id: 'legend',
			transform: '',
		},
		{
			glyph: BarChart,
			id: 'barchart',
			transform: 'rotate(90deg) rotateY(180deg)',
		},
		{
			glyph: Sliders,
			id: 'settings',
			transform: '',
		}
	],
	'string/stats': [
		{
			glyph: Layout,
			id: 'stats',
			transform: '',
		},
		{
			glyph: Legend,
			id: 'legend',
			transform: '',
		},
	],
	'string/time': [
		{
			glyph: TrendingUp,
			id: 'trends',
			transform: '',
		},
		{
			glyph: Legend,
			id: 'legend',
			transform: '',
		},
	],
}

export const getTabsIcons = route => {
	const currentRouteTabs = tabsByRoute[route] || [];

	return [
		{
			glyph: List,
			id: 'metrics',
			transform: '',
		},
		...currentRouteTabs,
		{
			glyph: Info,
			id: 'info',
			transform: '',
		},
		{
			glyph: Filter,
			id: 'filters',
			transform: '',
		},
	];
}

// TODO investigate using a store `derived` from _activeViewType & `_currentPage`
