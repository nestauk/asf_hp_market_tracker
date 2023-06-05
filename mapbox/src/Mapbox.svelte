<script>
	import mapboxgl from 'mapbox-gl';

	import MapboxglBase from './MapboxglBase.svelte';
	import MapboxglUnsupported from './MapboxglUnsupported.svelte';

	const isMapboxGLSupported = mapboxgl.supported();

	export let _bbox_WS_EN = null; // store
	export let _bbox_WSEN = null; // store
	export let _zoom = null; // store
	export let accessToken = null;
	export let bounds;
	export let geometry;
	export let getFeatureState;
	export let isAnimated = true;
	export let isInteractive = true;
	export let shouldCaptureCanvas = false;
	export let style;
	export let visibleLayers = [];
	export let withScaleControl = true;
	export let withZoomControl = true;
	export let _mapDataURL;
</script>

{#if isMapboxGLSupported}
	<MapboxglBase
		bind:_mapDataURL
		{_bbox_WS_EN}
		{_bbox_WSEN}
		{_zoom}
		{accessToken}
		{bounds}
		{geometry}
		{getFeatureState}
		{isAnimated}
		{isInteractive}
		{shouldCaptureCanvas}
		{style}
		{visibleLayers}
		{withScaleControl}
		{withZoomControl}
		on:bboxChanged
		on:mapClick
		on:mapLoaded
	>
		<slot />
	</MapboxglBase>
{:else}
	<MapboxglUnsupported />
{/if}
