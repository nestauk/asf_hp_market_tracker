<script>
	import {Scroller, HyperLink} from '@svizzle/ui';

	import * as metricInfos from '$lib/_content/metrics/index.js';
	import {scrollIntoViewIfTrue}
		from '$lib/components/svizzle/ui/actions/scrollIntoView.js';
	import {metricGroups} from '$lib/data/metrics.js';
	import {_isSmallScreen} from '$lib/stores/layout.js';
	import {
		_activeViewType,
		_currentMetricId,
		_searchParams,
	} from '$lib/stores/navigation.js';
	import {_pointerSupport} from '$lib/stores/pointer.js';
	import {_linkThemeMetricSelector} from '$lib/stores/theme.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';

	$: makeOnMouseMove = id => $_isSmallScreen
		? null
		: ({x, y}) => {
			$_tooltip = {
				component: metricInfos[id],
				x,
				y,
			}
		}
	$: onMouseOut = $_isSmallScreen ? null : clearTooltip;
</script>

<Scroller>
	{#each metricGroups as {key: entity, value}}
		<h2>{entity}</h2>
		<ul>
			{#each value as {id, label, type}}
				<li>
					<HyperLink
						href='/explorer/{type}/{$_activeViewType}/{id}?{$_searchParams}'
						theme={$_linkThemeMetricSelector}
					>
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						<div
							class:selected={id === $_currentMetricId}
							class='item'
							on:mousemove={$_pointerSupport.touchOnly ? null : makeOnMouseMove(id)}
							on:mouseout={onMouseOut}
							role='none'
							use:scrollIntoViewIfTrue={id === $_currentMetricId}
						>
							{label}
						</div>
					</HyperLink>
				</li>
			{/each}
		</ul>
	{/each}
</Scroller>

<style>
	h2 {
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	ul {
		list-style-type: none;
	}
	li:hover {
		background-color: var(--colorAux);
		color: var(--colorAuxText);
		cursor: pointer;
	}

	li:focus-within {
		outline: var(--outline);
		outline-offset: calc(-1 * var(--outlineWidth));
	}
	.item {
		padding: 0.3em 1rem;
	}
	.item.selected {
		background-color: var(--colorSelectedBackground) !important;
		color: var(--colorSelectedText) !important;
	}
</style>
