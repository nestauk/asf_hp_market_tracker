<script>
	import {setupResizeObserver} from '@svizzle/ui';

	import {coverageTooltips} from '$lib/config/labels.js';
	import {_staticData} from '$lib/stores/data.js';
	import {_tooltip, clearTooltip} from '$lib/stores/tooltip.js';
	import {_viewData, _viewDataCoverage} from '$lib/stores/view.js';

	const {
		_writable: _coverageSize,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	let filtered;
	let filteredHeight;
	let filteredOut;
	let filteredOutHeight;
	let filteredRatio;
	let originShift;
	let proceed = false;
	let retreivableRatio;
	let retreivableWidth;
	let side;
	let svgSide;
	let unretrievables;
	let unretrievablesPercentString;
	let unretrievableWidth;

	const ratio = 0.8;

	$: if ($_viewDataCoverage && $_coverageSize) {

		({blockSize: svgSide} = $_coverageSize);
		({
			filtered,
			filteredOut,
			filteredRatio,
			retreivableRatio,
			unretrievables,
			unretrievablesPercentString,
		} = $_viewDataCoverage);

		side = svgSide * ratio;
		originShift = svgSide * (1 - ratio) / 2;

		retreivableWidth = retreivableRatio * side; // left
		filteredHeight = filteredRatio * side; // top-left
		filteredOutHeight = side - filteredHeight; // bottom-left
		unretrievableWidth = side - retreivableWidth; // right

		proceed = true;

	}
</script>

{#if proceed}
	<div
		class='QuickStatsMedium'
		style='--svgSide:{svgSide}px;'
	>
		<div class='flex filteredStat'>
			<div class='square filtered'></div>
			<div class='amount'>
				<span class='number'>{filtered}</span>
				<span class='label'>installations</span>
			</div>
		</div>

		<div
			class='coverage'
			use:sizeObserver
		>
			<div
				class='left'
				class:singleRow={!filteredOut}
			>
				<div class='flex justifyEnd'>
					<div class='amount'>
						<span class='number'>({filtered})</span>
						<span class='label'>included</span>
					</div>
					<div class='square filtered'></div>
				</div>
				{#if filteredOut}
					<div class='flex justifyEnd'>
						<div class='amount'>
							<span class='number'>({filteredOut})</span>
							<span class='label'>excluded</span>
						</div>
						<div class='square filteredOut'></div>
					</div>
				{/if}
			</div>

			<div class='viz'>
				<svg
					height='{svgSide}px'
					width='{svgSide}px'
				>
					<g transform='translate({originShift},{originShift})'>
						<rect
							class='filtered'
							height={filteredHeight}
							on:mousemove={({x, y}) => {
								_tooltip.set({
									key: coverageTooltips.filtered,
									x, y
								})
							}}
							on:mouseleave={clearTooltip}
							width={retreivableWidth}
						/>
						<rect
							class='filteredOut'
							height={filteredOutHeight}
							on:mousemove={({x, y}) => {
								_tooltip.set({
									key: coverageTooltips.filteredOut,
									x, y
								})
							}}
							on:mouseleave={clearTooltip}
							width={retreivableWidth}
							y={filteredHeight}
						/>
						<rect
							class='unretrievable'
							height={side}
							on:mousemove={({x, y}) => {
								_tooltip.set({
									key: coverageTooltips.unretrievable,
									x, y
								})
							}}
							on:mouseleave={clearTooltip}
							width={unretrievableWidth}
							x={retreivableWidth}
						/>
					</g>
				</svg>
			</div>

			<div class='flex right'>
				<div class='square unretrievable'></div>
				<div class='amount'>
					<span class='label'>unavail.</span>
					<span class='number'>({unretrievables} | {unretrievablesPercentString}%)</span>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.QuickStatsMedium {
		display: grid;
		grid-template-areas: 'filteredStat coverage';
		grid-template-columns: 40% 60%;
		grid-template-rows: 100%;
		height: 100%;
		padding: 0.5em 1em;
		width: 100%;
	}
	.flex {
		align-items: center;
		display: flex;
	}
	.justifyEnd {
		justify-content: flex-end;
	}

	.filteredStat {
		border-right: var(--border);
		grid-area: filteredStat;
		justify-content: center;
		padding: 0 1em;
	}
	.filteredStat .amount {
		align-items: baseline;
		display: flex;
	}
	.filteredStat .amount .number {
		font-size: 2em;
		font-weight: bolder;
	}
	.filteredStat .amount .label {
		padding-left: 0.5em;
	}

	.coverage {
		display: grid;
		grid-area: coverage;
		grid-template-areas: 'left mid right';
		grid-template-columns: 1fr var(--svgSide) 1fr;
		grid-template-rows: 100%;
		height: 100%;
		width: 100%;
	}
	.coverage .left {
		display: grid;
		grid-area: left;
		grid-template-columns: 100%;
		grid-template-rows: 50% 50%;
		height: 100%;
		padding-right: 0.5em;
		width: 100%;
	}
	.coverage .left.singleRow {
		grid-template-rows: 100%;
	}
	.coverage .mid {
		grid-area: mid;
	}
	.coverage .right {
		grid-area: right;
		padding-left: 0.5em;
	}

	svg {
		height: 100%;
		width: 100%;
	}
	rect {
		stroke: var(--colorStatsBorder);
	}
	rect.filtered {
		fill: var(--colorStatsFiltered);
	}
	rect.filteredOut {
		fill: var(--colorStatsFilteredOut);
	}
	rect.unretrievable {
		fill: var(--colorStatsUnretrievable);
	}

	.square {
		border: thin solid var(--colorStatsBorder);
		min-height: 0.8em;
		margin: 0.5em;
		min-width: 0.8em;
	}
	.square.filtered {
		background-color: var(--colorStatsFiltered);
	}
	.square.filteredOut {
		background-color: var(--colorStatsFilteredOut);
	}
	.square.unretrievable {
		background-color: var(--colorStatsUnretrievable);
	}
</style>
