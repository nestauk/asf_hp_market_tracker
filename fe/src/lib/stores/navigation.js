import {decapitalize} from '@svizzle/utils';
import {derived, writable} from 'svelte/store';

import {
	defaultMetricId,
	metricById,
	metricTitleById,
} from '$lib/data/metrics.js';
import {context} from '$lib/statechart/context.js';
import {objectToSearchParams, risonifyValues} from '$lib/utils/svizzle/url.js';

export const _activeViewType = writable('geo');

export const _currentMetricId = writable(defaultMetricId);
export const _currentMetric = writable(metricById[defaultMetricId]);
export const _currentMetricTitle = derived(
	[_activeViewType, _currentMetric],
	([activeViewType, {id, type, unitOfMeasure}]) => {
		const metricTitle = metricTitleById[id];
		const title = activeViewType === 'geo' && type === 'number'
			? `Average ${decapitalize(metricTitle)}`
			: metricTitle;
		const unitOfMeasureLabel = unitOfMeasure ? ` [${unitOfMeasure}]` : '';

		return `${title}${unitOfMeasureLabel}`;
	}
);

export const _currentPage = writable();

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
	selection => {
		const serialisedSelection = risonifyValues(selection);
		const searchParams = objectToSearchParams(serialisedSelection);

		return searchParams;
	}
);
