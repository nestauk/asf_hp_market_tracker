import regionsByType from '$lib/data/regions.json' assert {type: 'json'};

export default regionsByType;

// FIXME can't assert json in svelte files
// this module might soon not be needed, see https://github.com/vitejs/vite/issues/4934
