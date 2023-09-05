import {
	BarChart,
	Filter,
	Info,
	List,
	MapPin,
} from '@svizzle/ui';

const tabsByRoute = {
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
