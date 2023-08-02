import * as _ from 'lamb';
import {derived, writable} from 'svelte/store';

export const _isViewLoading = writable(false);
export const _isViewReady = writable(false);
export const _viewData = writable();

export const _showMessage = derived(
	[_isViewReady, _viewData],
	([isViewReady, viewData]) =>
		isViewReady && String(viewData?.response.code).startsWith('1')
		// see `be/README.md`: `Custom response codes`
);
export const _viewDataMessage = derived(
	_viewData,
	viewData => viewData?.response.message
);
