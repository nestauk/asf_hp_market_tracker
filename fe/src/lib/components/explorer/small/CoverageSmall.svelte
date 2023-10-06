<script>
	import {setupResizeObserver} from '@svizzle/ui';

	import {coverageTooltips} from '$lib/config/labels.js';
	import {_tooltip} from '$lib/stores/tooltip.js';
	import {_viewDataCoverage} from '$lib/stores/view.js';

	const {
		_writable: _vizSize,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	let filtered;
	let filteredHeight;
	let filteredOut;
	let filteredOutHeight;
	let filteredRatio;
	let proceed = false;
	let retreivableRatio;
	let retreivableWidth;
	let side;
	let unretrievables;
	let unretrievablesPercentString;
	let unretrievableWidth;

	$: if ($_vizSize && $_viewDataCoverage) {
		({blockSize: side} = $_vizSize);
		({
			filtered,
			filteredOut,
			filteredRatio,
			retreivableRatio,
			unretrievables,
			unretrievablesPercentString,
		} = $_viewDataCoverage);

		retreivableWidth = retreivableRatio * side; // left
		filteredHeight = filteredRatio * side; // top-left
		filteredOutHeight = side - filteredHeight; // bottom-left
		unretrievableWidth = side - retreivableWidth; // right

		proceed = true;
	}
</script>

<div class='CoverageSmall'>
	<div
		class='flex viz'
		use:sizeObserver
	>
		<div class='svgContainer'>
			{#if proceed}
				<svg
					height='{side}px'
					width='{side}px'
				>
					<!-- top-left -->
					<rect
						class='filtered'
						height={filteredHeight}
						on:touchstart|preventDefault={({targetTouches: [touch]}) => {
							const {clientX: x, clientY: y} = touch;
							_tooltip.set({
								key: coverageTooltips.filtered,
								x, y
							})
						}}
						width={retreivableWidth}
					/>

					<!-- bottom-left -->
					<rect
						class='filteredOut'
						height={filteredOutHeight}
						on:touchstart|preventDefault={({targetTouches: [touch]}) => {
							const {clientX: x, clientY: y} = touch;
							_tooltip.set({
								key: coverageTooltips.filteredOut,
								x, y
							})
						}}
						width={retreivableWidth}
						y={filteredHeight}
					/>

					<!-- right -->
					<rect
						class='unretrievable'
						height={side}
						on:touchstart|preventDefault={({targetTouches: [touch]}) => {
							const {clientX: x, clientY: y} = touch;
							_tooltip.set({
								key: coverageTooltips.unretrievable,
								x, y
							})
						}}
						width={unretrievableWidth}
						x={retreivableWidth}
					/>
				</svg>
			{/if}
		</div>
	</div>

	{#if proceed}
		<div class='figures'>
			<div class='flex'>
				<div class='square filtered'></div>
				<span>included: {filtered}</span>
			</div>
			{#if filteredOut}
				<div class='flex'>
					<div class='square filteredOut'></div>
					<span>excluded: {filteredOut}</span>
				</div>
			{/if}
			<div class='flex'>
				<div class='square unretrievable'></div>
				<span>unavail: {unretrievables} ({unretrievablesPercentString}%)</span>
			</div>
		</div>
	{/if}
</div>

<style>
	.CoverageSmall {
		width: 100%;
		display: grid;
		grid-template-rows: 1fr 1fr;
		gap: 0.5em;
	}

	.flex {
		align-items: center;
		display: flex;
		justify-content: center;
	}

	.viz {
		height: 4em;
		width: 100%;
	}
	.svgContainer {
		height: 100%;
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

	.figures {
		width: 100%;
	}
	.square {
		border: thin solid var(--colorStatsBorder);
		min-height: 0.8em;
		margin-right: 0.5em;
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
