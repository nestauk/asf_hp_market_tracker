import {writable} from 'svelte/store';

export const setupGeometryObserver = () => {
	const _geometry = writable();

	const geometryObserver = node => {
		const observer = new ResizeObserver(() => {
			_geometry.set(node.getBoundingClientRect())
		});
		observer.observe(node);

		return () => observer.disconnect();
	}

	return {_geometry, geometryObserver}
}
