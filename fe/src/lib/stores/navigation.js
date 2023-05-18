import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

import {
	defaultMetric,
	metricById,
	metricTitleById,
} from '$lib/data/metrics.js';
import {context} from '$lib/statechart/context.js';

export const _activeViewType = writable('stats');
export const _currentMetricId = writable(defaultMetric.id);
export const _currentMetric = derived(_currentMetricId, id => metricById[id]);
export const _currentMetricTitle = derived(
	_currentMetricId,
	id => metricTitleById[id]
);
export const _expectedRoute = derived(
	[_activeViewType, _currentMetric],
	([activeViewType, currentMetric]) => {
		const {id, type} = currentMetric;
		return `/explorer/${type}/${activeViewType}/${id}`;
	}
);

export const _selection = writable(context.selection);

export const _searchParams = derived(
	_selection,
	selection => new URLSearchParams(selection)
);