<script>
	import {Icon, XCircle} from '@svizzle/ui';
	import {isIterableEmpty, toggleItem} from '@svizzle/utils';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import DismissOrApply from '$lib/components/explorer/DismissOrApply.svelte';
	import {
		DEFAULT_BBOX_WS_EN,
		MAPBOXGL_ACCESSTOKEN as accessToken,
		regionTypeToFeatureNameId,
	} from '$lib/config/map.js';
	import {_mapStyle} from '$lib/stores/maps.js';
	import {_currThemeVars, _xorNavigatorTheme} from '$lib/stores/theme.js';
	import XorNavigator from '$lib/components/svizzle/ui/XorNavigator.svelte';
	import {doPairItemsContainSameValues} from '$lib/utils/svizzle/utils.js';

	import {Mapbox} from '@svizzle/mapbox'; // workspace

	export let mapHeight = '300px';
	export let targetRegionNames;
	export let targetRegionType;
	export let title = 'Title here';

	const dispatch = createEventDispatcher();

	let hoveredRegionName = null;

	/* init props */

	$: regionNames = targetRegionNames;
	$: areAllRegionsSelected = isIterableEmpty(regionNames);
	$: regionType = targetRegionType;
	$: title = title ?? 'Title here';

	/* confirmation buttons */

	$: isDirty =
		regionType !== targetRegionType ||
		!doPairItemsContainSameValues([
			regionNames,
			targetRegionNames
		]);

	const onDismiss = () => {
		regionNames = targetRegionNames;
		regionType = targetRegionType;
	};
	const onApply = () => {
		dispatch('apply', {
			regionNames: _.sort(regionNames),
			regionType
		})
	};

	/* region type change */

	const onRegionTypeChange = ({detail}) => {
		regionType = detail;
		if (regionType === targetRegionType) {
			regionNames = targetRegionNames;
		} else {
			regionNames = []; // TODO use the hierarchy to determine what's selected
		}
	}

	const toggleRegionName = name => {
		regionNames = toggleItem(regionNames, name);
	}

	/* map */

	$: featureNameId = regionTypeToFeatureNameId[regionType];
	$: getFeatureState = feature => {
		const {properties: {[featureNameId]: featureName}} = feature;

		const featureState = {
			fill: areAllRegionsSelected || regionNames.includes(featureName)
				? $_currThemeVars['--colorMapRegionFillSelected']
				: null,
			stroke: areAllRegionsSelected || regionNames.includes(featureName)
				? $_currThemeVars['--colorMapRegionStrokeSelected']
				: null
		};

		return featureState;
	}

	const onMouseMove = event => {
		if (event.target.isPointOnSurface(event.point)) {
			const hoveredFeature = _.filter(
				event.target.queryRenderedFeatures(event.point),
				({sourceLayer}) => sourceLayer === regionType
			)[0];
			hoveredRegionName = hoveredFeature?.properties[featureNameId];
			event.target.getCanvas().style.cursor = 'pointer';
		} else {
			onMouseLeave(event);
		}
	}
	const onClick = () => {
		hoveredRegionName && toggleRegionName(hoveredRegionName);
	}
	const onMouseLeave = event => {
		hoveredRegionName = null;
		event.target.getCanvas().style.cursor = '';
	}
	$: eventsHandlers = [
		{
			type: 'mousemove',
			targetLayer: regionType,
			handler: onMouseMove
		},
		{
			type: 'click',
			targetLayer: regionType,
			handler: onClick
		},
		{
			type: 'mouseleave',
			targetLayer: regionType,
			handler: onMouseLeave
		}
	];

	/* list of names */

	const makeDeselectRegionName = regionName => () => {
		toggleRegionName(regionName);
	}
</script>

<div
	class='RegionFilter'
	style='--mapHeight:{mapHeight}'
>
	<h3>{title}</h3>

	<!-- map -->

	<div class='map'>
		<Mapbox
			{accessToken}
			{eventsHandlers}
			{getFeatureState}
			bounds={DEFAULT_BBOX_WS_EN}
			isAnimated={false}
			isDblClickEnabled={false}
			isInteractive={true}
			reactiveLayers={[regionType]}
			style={$_mapStyle}
			visibleLayers={['nuts21_0', regionType]}
			withScaleControl={false}
			withZoomControl={false}
		/>
	</div>

	<!-- region type selector -->

	<XorNavigator
		currentValue={regionType}
		on:changed={onRegionTypeChange}
		theme={$_xorNavigatorTheme}
		valuesToLabels={{
			country21: 'Country',
			itl21_1: 'ITL 1',
			itl21_2: 'ITL 2',
			itl21_3: 'ITL 3',
			lad21: 'LAD',
		}}
	/>

	<!-- hovered region -->

	<div
		class='hoveredRegion'
		class:active={hoveredRegionName}
	>
		Hovering: {hoveredRegionName || 'none'}
	</div>

	<!-- list of regions -->

	<ul>
		{#each regionNames as name}
			<li>
				<span>{name}</span>
				<div
					class='iconButton'
					on:click={makeDeselectRegionName(name)}
				>
					<Icon
						glyph={XCircle}
						size=20
					/>
				</div>
			</li>
		{/each}
	</ul>

	<!-- confirmation buttons -->

	{#if isDirty}
		<DismissOrApply
			{onApply}
			{onDismiss}
		/>
	{/if}
</div>

<style>
	.RegionFilter {
		display: grid;
		padding: 1em;
		width: 100%;
	}

	.map {
		background-color: azure; /* sea */
		border: thin solid lightgrey;
		height: var(--mapHeight);
		width: 100%;
	}

	.hoveredRegion {
		align-items: center;
		color: var(--colorTextDisabled); /* global theme */
		display: flex;
		justify-content: center;
		min-height: 4em;
		text-align: center;
	}
	.hoveredRegion.active {
		color: var(--colorAuxText); /* global theme */
	}

	li {
		align-items: center;
		display: flex;
		justify-content: space-between;
		margin-bottom: 1em;
	}
	.iconButton {
		cursor: pointer;
		padding-left: 1em;
	}
</style>
