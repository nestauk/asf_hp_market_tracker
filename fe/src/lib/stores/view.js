import {writable} from 'svelte/store';

export const _isViewLoading = writable(false);
export const _viewData = writable();
