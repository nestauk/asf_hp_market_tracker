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
	export let eventsHandlers = null;
	export let getFeatureState;
	export let isAnimated = true;
	export let isDblClickEnabled = true;
	export let isInteractive = true;
	export let reactiveLayers;
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
		{eventsHandlers}
		{getFeatureState}
		{isAnimated}
		{isDblClickEnabled}
		{isInteractive}
		{reactiveLayers}
		{style}
		{visibleLayers}
		{withScaleControl}
		{withZoomControl}
		on:bboxChanged
		on:mapClick
		on:mapFeaturesHovered
		on:mapFeaturesTouchStarted
	>
		<slot />
	</MapboxglBase>
{:else}
	<MapboxglUnsupported />
{/if}
