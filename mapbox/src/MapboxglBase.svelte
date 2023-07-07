<script>
	import 'mapbox-gl/dist/mapbox-gl.css';

	import geoViewport from '@mapbox/geo-viewport';
	import mapboxgl from 'mapbox-gl';
	import {createEventDispatcher, onMount, setContext} from 'svelte';
	import {derived, writable} from 'svelte/store';

	import {
		FIT_PADDING,
		MAPBOXGL_MAX_ZOOM,
		MAPBOXGL_MIN_ZOOM,
		MAPBOXGL_TILE_SIZE
	} from './consts';
	import {ws_en_to_wsen} from './util';

	const dispatch = createEventDispatcher();

	export let _bbox_WS_EN = null; // store
	export let _bbox_WSEN = null; // store
	export let _zoom = null; // store
	export let accessToken = null;
	export let bounds;
	export let eventsHandlers;
	export let getFeatureState;
	export let isAnimated = true;
	export let isDblClickEnabled = true;
	export let isInteractive = true;
	export let reactiveLayers = [];
	export let style;
	export let visibleLayers = [];
	export let withScaleControl = true;
	export let withZoomControl = true;

	/* props sanitisation */

	$: isDblClickEnabled = isDblClickEnabled ?? true;
	$: isAnimated = isAnimated ?? true;
	$: isInteractive = isInteractive ?? true;
	$: _bbox_WS_EN = _bbox_WS_EN || writable([[-180, -90], [180, 90]]);
	$: _bbox_WSEN = _bbox_WSEN || derived(_bbox_WS_EN, bbox_WS_EN => bbox_WS_EN.length ?? ws_en_to_wsen(bbox_WS_EN));
	$: _zoom = _zoom || writable(0);
	$: visibleLayers = visibleLayers || [];
	$: reactiveLayers = reactiveLayers || [];

	/* props */

	let eventsHandlersRegistry = [];
	let height = 0;
	let map;
	let mapcontainer;
	let width = 0;

	const _bbox = writable($_bbox_WS_EN);
	const _map = writable();
	const _projectFn = writable(x => x);

	setContext('mapBox', {
		_bbox,
		_map,
		_projectFn
	});

	/* updating layers */

	$: map?.setStyle(style);
	$: layers = $_map && style && $_map?.getStyle().layers;
	$: layers?.forEach(layer => {
		if (reactiveLayers.includes(layer.id)) {
			map
			.querySourceFeatures(layer.source, {sourceLayer: layer.id})
			.forEach(feature => {
				const state = getFeatureState(feature);
				state && map.setFeatureState({
					id: feature.id,
					source: layer.source,
					sourceLayer: layer.id,
				}, state);
			});
		}

		map?.setLayoutProperty(
			layer.id,
			'visibility',
			visibleLayers.includes(layer.id) ? 'visible' : 'none'
		);
	});
	$: {
		eventsHandlersRegistry.forEach(
			({type, targetLayer, handler}) => {
				map?.off(type, targetLayer, handler);
			}
		);
		eventsHandlers?.forEach(
			({type, targetLayer, handler}) => {
				map?.on(type, targetLayer, handler);
			}
		);
		eventsHandlersRegistry = eventsHandlers ?? [];
	};

	/* bbox */

	$: $_bbox = $_bbox_WS_EN
	$: viewport = geoViewport.viewport(
		ws_en_to_wsen($_bbox_WS_EN),
		[width, height],
		MAPBOXGL_MIN_ZOOM,
		MAPBOXGL_MAX_ZOOM,
		MAPBOXGL_TILE_SIZE
	);

	/* controls */

	const addAttributionControl = () => {
		map.addControl(
			new mapboxgl.AttributionControl({
				compact: true
			})
		)
	};

	const addScaleControl = () => {
		map.addControl(
			new mapboxgl.ScaleControl({
				maxWidth: 80,
				unit: 'metric'
			}),
			'top-right'
		);
	};

	const addZoomControl = () => {
		map?.addControl(
			new mapboxgl.NavigationControl({
				showCompass: false
			}),
			'bottom-right'
		);
	};

	const addControls = () => {
		addAttributionControl();

		if (withScaleControl) {
			addScaleControl();
		}

		if (withZoomControl) {
			addZoomControl();
		}
	};

	/* bbox */

	const fitToBbox = bbox_WSEN => {
		map?.fitBounds(bbox_WSEN, {
			animate: isAnimated,
			linear: true,
			padding: {
				bottom: FIT_PADDING,
				left: FIT_PADDING,
				right: FIT_PADDING,
				top: FIT_PADDING,
			}
		});
	};

	/* events */

	const updateBbox = () => {
		if (map) {
			const mapBounds = map.getBounds().toArray();
			$_bbox_WS_EN = mapBounds;
			$_bbox = mapBounds;
		}
	}

	const updateZoom = () => {
		if (map) {
			const zoom = map.getZoom();
			$_zoom = zoom;
		}
	}

	const setMapEvents = () => {
		map.on('move', event => {
			updateBbox();
			const {originalEvent} = event;
			if (originalEvent && originalEvent.type !== 'resize') {
				dispatch('bboxChanged');
			}
		})
		.on('zoom', () => {
			updateZoom();
		})
		.on('boxzoomend', () => {
			dispatch('bboxChanged');
		})
		.on('click', () => {
			dispatch('mapClick');
		});
	}

	/* methods */

	// FIXME TBD: bind instead?
	const setGeometry = () => {
		if (!mapcontainer) {
			return;
		}

		const elementGeometry = getComputedStyle(mapcontainer);
		width = parseFloat(elementGeometry.width);
		height = parseFloat(elementGeometry.height);
	};

	const mapgl = node => {
		const {center, zoom} = viewport;

		mapboxgl.accessToken = accessToken;

		map = new mapboxgl.Map({
			center,
			container: node,
			maxZoom: MAPBOXGL_MAX_ZOOM,
			minZoom: MAPBOXGL_MIN_ZOOM,
			renderWorldCopies: true,
			style,
			zoom,

			// interactions
			attributionControl: false, // we add this later to have it compact
			doubleClickZoom: isDblClickEnabled,
			dragPan: isInteractive,
			dragRotate: false,
			interactive: isInteractive,
			pitchWithRotate: false, // don't render dots in perspective
			scrollZoom: isInteractive,
			touchPitch: false,
			touchZoomRotate: isInteractive,
		})
		.on('load', () => {
			setMapEvents();
			bounds && fitToBbox(bounds);
			updateZoom();

			setGeometry(); // ipad FIXME: initial svg is 100x100

			$_map = map;
			$_projectFn = map.project.bind(map);
		});

		map.touchZoomRotate.disableRotation();

		// controls

		addControls();
	};

	/* lifecycle */

	onMount(() => {
		setGeometry();
	});

	const onResize = () => {
		setGeometry();
		bounds && fitToBbox(bounds);
	}

	$: bounds && fitToBbox(bounds);
</script>

<svelte:window on:resize={onResize} />

<div class='MapboxglBase'>
	<div
		bind:this={mapcontainer}
		class='mapcontainer'
		use:mapgl
	></div>
</div>
{#if $_map}
	<slot />
{/if}

<style>
	.MapboxglBase {
		height: 100%;
		position: relative;
		width: 100%;
	}

	.mapcontainer {
		height: 100%;
		width: 100%;
	}

	/*
		Outlines inside of MapboxGL instances must be themed directly
		using its own CSS classes.
	*/
	.MapboxglBase :global(.mapboxgl-canvas:focus-visible),
	.MapboxglBase :global(.mapboxgl-ctrl-group button:focus:focus-visible),
	.MapboxglBase :global(.mapboxgl-ctrl-logo:focus:focus-visible),
	.MapboxglBase :global(.mapboxgl-ctrl-attrib-button:focus) {
		box-shadow: none !important;
		/* box-shadow: var(--focusShadow) !important; */
		outline: var(--outline);
		outline-offset: calc(var(--focusLineWidth) * -1);
	}
</style>
