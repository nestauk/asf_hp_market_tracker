<script>
	import {applyFnMap, getKey, getValue, getValues} from '@svizzle/utils';
	import * as _ from 'lamb';

	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import SizeSensor from '$lib/components/svizzle/SizeSensor.svelte';

	import ColumnNames from './ColumnNames.svelte';

	export let categories;
	export let colorScale;
	export let domain;
	export let items;
	export let labelsByCategory;

	/* data */

	const reshapeItems = _.mapWith(applyFnMap({
		key: getKey,
		values: _.pipe([
			getValues,
			_.mapWith(_.collect([getKey, getValue])),
			_.fromPairs
		])
	}));

	let doDraw = false;
	let extraWidth;
	let maxSize;
	let reshapedItems;

	$: maxValue = domain[1] || 1;
	$: sideScale = value => maxSize * Math.sqrt(value / maxValue || 0);
	$: if (items && categories) {
		reshapedItems = reshapeItems(items);
		doDraw = true;
	}
</script>

{#if doDraw}
	<div
		class='ScrollableGrid'
		style='--columns: {categories.length}; --maxSize: {maxSize}px;'
	>
		<!-- header -->
		<SizeSensor bind:blockSize={maxSize}>
			<ColumnNames
				{categories}
				{extraWidth}
				{labelsByCategory}
			/>
		</SizeSensor>

		<!-- content -->
		<Scroller bind:extraWidth>
			{#each reshapedItems as {key, values}}
				<div class='valueRow'>
					{#each categories as subKey}
						{@const value = values?.[subKey]}
						<div class='box'>
							<div
								class='square'
								style='
									--width: {sideScale(value)}px;
									background-color: {colorScale(value)};
								'
							/>
						</div>
					{/each}
				</div>
				<div class='labelRow'>
					{key}
				</div>
			{/each}
		</Scroller>

		<!-- footer -->
		<ColumnNames
			{categories}
			{extraWidth}
			{labelsByCategory}
		/>
	</div>
{/if}

<style>
	.ScrollableGrid {
		display: grid;
		grid-template-rows: min-content 1fr min-content;
		height: 100%;
		width: 100%;
	}
	.headerRow,
	.valueRow {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		justify-content: stretch;
		justify-items: center;
	}
	.valueRow {
		height: calc(var(--maxSize) + 2px);
	}
	.labelRow {
		align-items: center;
		border-top: thin solid var(--colorRefLine);
		display: flex;
		height: min-content;
		justify-content: center;
		margin-bottom: 1em;
		padding-top: 0.75em;
		text-align: center;
	}
	.box {
		align-items: end;
		display: flex;
		justify-content: center;
	}
	.square {
		background-color: var(--colorPrimary);
		background: white;
		border: thin solid var(--colorBorderAux);
		height: var(--width);
		width: var(--width);
	}
</style>
