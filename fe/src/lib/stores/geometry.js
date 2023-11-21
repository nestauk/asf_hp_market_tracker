import {derived} from 'svelte/store';

import {_glyph} from '$lib/stores/layout.js';

export const _glyphGeometry = derived(
	_glyph,
	glyph => ({
		glyphHeight: glyph?.height,
		glyphWidth: glyph?.width,
	})
);

export const _barchartGeometry = derived(
	_glyph,
	glyph => ({
		glyphHeight: glyph?.height,
		glyphWidth: glyph?.width,
		padding: 0,
	})
);
