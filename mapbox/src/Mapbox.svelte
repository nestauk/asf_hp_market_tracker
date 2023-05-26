<script>
	import mapboxgl from 'mapbox-gl';

	import MapboxglBase from './MapboxglBase.svelte';
	import MapboxglUnsupported from './MapboxglUnsupported.svelte';

	const isMapboxGLSupported = mapboxgl.supported();

	export let _bbox_WS_EN = null;
	export let _bbox_WSEN = null;
	export let _zoom = null;
	export let accessToken;
	export let bounds;
	export let getFeatureState;
	export let isAnimated = true;
	export let isInteractive = true;
	export let style;
	export let visibleLayers;
	export let withScaleControl = true;
	export let withZoomControl = true;

</script>

{#if isMapboxGLSupported}
	<MapboxglBase
		{_bbox_WS_EN}
		{_bbox_WSEN}
		{_zoom}
		{accessToken}
		{bounds}
		{getFeatureState}
		{isAnimated}
		{isInteractive}
		{style}
		{visibleLayers}
		{withScaleControl}
		{withZoomControl}
		on:bboxChanged
		on:mapClick
	>
		<slot />
	</MapboxglBase>
{:else}
	<MapboxglUnsupported />
{/if}
