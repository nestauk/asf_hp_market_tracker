import {
	BarChart,
	Filter,
	Info,
	List,
	MapPin,
	PieChart,
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
			glyph: PieChart,
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
}

export const getTabsIcons = route => {
	const currentRouteTabs = tabsByRoute[route] || [];

	return [
		{
			glyph: Filter,
			id: 'filters',
			transform: '',
		},
		...currentRouteTabs,
		{
			glyph: Info,
			id: 'info',
			transform: '',
		},
		{
			glyph: List,
			id: 'metrics',
			transform: '',
		},
	];
}

// TODO investigate using a store `derived` from _activeViewType & `_currentPage`
