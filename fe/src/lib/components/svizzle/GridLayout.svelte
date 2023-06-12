<script>
	import {setupResizeObserver} from '@svizzle/ui';
	import * as _ from 'lamb';

	export let computedDimensions = [1, 1];
	export let keys = [];
	// export let maxKeys = 16;
	export let preferredAspectRatio = 1;

	const {_writable: _gridSize, resizeObserver: gridObserver} =
		setupResizeObserver();

	// $: factors = _.range(1, maxKeys + 1).filter(n => maxKeys % n === 0);

	const getMaxRectangles = (
		containerWidth,
		containerHeight,
		rectWidth,
		rectHeight
	) => {
		const numFitHorizontally = Math.floor(containerWidth / rectWidth);
		const numFitVertically = Math.floor(containerHeight / rectHeight);
		return {numFitHorizontally, numFitVertically};
	}

	const getBestRectangleFit = (
		containerWidth,
		containerHeight,
		aspectRatio,
		maxRects
	) => {
		let width = containerWidth;
		let height = width / aspectRatio;

		let rectanglesFit;
		do {
			rectanglesFit = getMaxRectangles(
				containerWidth,
				containerHeight,
				width,
				height
			);
			if (
				rectanglesFit.numFitHorizontally *
				rectanglesFit.numFitVertically < maxRects
			) {
				width -= 16;
				height = width / aspectRatio;
			}
		} while (
			rectanglesFit.numFitHorizontally * rectanglesFit.numFitVertically
			< maxRects
		)

		return {
			...rectanglesFit,
			height,
			width
		};
	}

	const chunkArray = (array, size, filler = null) => {
		const chunkIndices = _.range(0, array.length, size);
		const chunks = _.map(chunkIndices, i => _.slice(array, i, i + size));

		// Add filler cells to the last chunk to complete the grid
		// FIXME add filler cells around existing cells, not only at the end
		const lastChunk = chunks[chunks.length - 1];
		while (lastChunk.length < size) {
			lastChunk.push(filler);
		}

		return chunks;
	}

	let bestFit;
	let gridRows = [[]];

	$: if (keys.length > 0) {

		const {
			inlineSize: width,
			blockSize: height
		} = $_gridSize;
		if (width && height) {
			bestFit = getBestRectangleFit(
				width,
				height,
				preferredAspectRatio,
				keys.length
			);

			console.log('bestFit', bestFit);
			if (bestFit) {
				// expand width & height
/* 
				bestFit.width = 
					width / bestFit.numFitHorizontally;
				bestFit.height =
					height / bestFit.numFitVertically;
 */
				gridRows = chunkArray(
					keys,
					bestFit.numFitHorizontally
				);
				console.log('gridRows', gridRows);
				computedDimensions = {
					width: bestFit.width,
					height: bestFit.height
				};
			}
		}
	}
</script>

<div
	class='GridLayout'
	style='--repeat: {bestFit?.numFitHorizontally || 1};'
	use:gridObserver
>
	{#if bestFit}
		{#each gridRows as chunk}
			{#each chunk as key}
				<div class='cell'>
					{#if key}
						<slot {key} />
					{/if}
				</div>
			{/each}
		{/each}
	{/if}
</div>

<style>
	.GridLayout {
		width: 100%;
		height: 100%;
		overflow: hidden;
		display: grid;
		grid-gap: 0;
		grid-template-columns: repeat(var(--repeat), 1fr);
		justify-content: center;
		justify-items: stretch;
	}
</style>
