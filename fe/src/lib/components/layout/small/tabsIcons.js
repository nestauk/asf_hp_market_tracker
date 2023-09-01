import {
	BarChart,
	Filter,
	Info,
	List,
	MapPin,
	PieChart,
} from '@svizzle/ui';

const tabsByRoute = {
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
	]
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
