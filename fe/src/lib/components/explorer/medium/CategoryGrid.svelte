<script>
	import * as _ from 'lamb';
	import {applyFnMap, getKey, getValue, getValues} from '@svizzle/utils';;

	export let colorScale;
	export let columnKeys;
	export let domain;
	export let items;

	const maxSize = 8;
	const computeSquareSize = value => maxSize * Math.sqrt(value / maxValue || 0);

	const reshapeItems = _.mapWith(applyFnMap({
		key: getKey,
		values: _.pipe([
			getValues,
			_.mapWith(_.collect([getKey, getValue])),
			_.fromPairs
		])
	}));

	let doDraw = false;
	let maxValue = domain[1];
	let reshapedItems;
	let rowKeys = [];

	$: if (items && columnKeys) {
		reshapedItems = reshapeItems(items);
		console.log('reshapedItems', reshapedItems)
		rowKeys = _.pipe([
			_.mapWith(getKey),
			_.sortWith([])
		])(items);
		console.log('rowKeys', rowKeys)

		doDraw = true;
	}
</script>

{#if doDraw}
	<ol>
		{#each columnKeys as columnLabel}
			<li>{columnLabel}</li>
		{/each}
	</ol>

	<div class='grid' style='--columns: {columnKeys.length}; --maxSize: {maxSize}px;'>
		{#each reshapedItems as {key, values}}
			<div class='valueRow'>
				{#each columnKeys as subKey}
					{@const value = values?.[subKey]}
					<div
						class='square'
						style='--width: {computeSquareSize(value)}px; background-color: {colorScale(value)};'
					/>
				{/each}
			</div>
			<div class='labelRow'>
				{key}
			</div>
		{/each}
	</div>
{/if}

<style>
	ol {
		list-style: none;
		counter-reset: li;
		padding-left: 0;
	}

	ol li {
		position: relative;
		padding-left: 2.5em;
		margin-bottom: .5em;
	}

	ol li::before {
		counter-increment: li;
		content: counter(li);
		position: absolute;
		left: 0;
		width: 1.6em;
		height: 1.6em;
		border: 2px solid white;
		border-radius: 50%;
		text-align: center;
		line-height: 1.6em;
		font-size: .8em;
	}

	.grid {
		display: grid;
		grid-auto-flow: row;
	}
	.valueRow {
		display: grid;
		grid-template-columns: repeat(var(--columns), 1fr);
		height: var(--maxSize);
	}
	.square {
		background-color: var(--colorPrimary);
		background: white;
		height: var(--width);
		width: var(--width);
	}
</style>
