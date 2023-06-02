<script>
	import {Scroller} from '@svizzle/ui';
	import {applyFnMap, getKey, getValue, getValues} from '@svizzle/utils';
	import * as _ from 'lamb';


	export let colorScale;
	export let columnKeys;
	export let domain;
	export let items;

	const maxSize = 20;
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
		rowKeys = _.pipe([
			_.mapWith(getKey),
			_.sortWith([])
		])(items);

		doDraw = true;
	}
</script>

{#if doDraw}
	<div
		class='grid'
		style='--columns: {columnKeys.length}; --maxSize: {maxSize}px;'
	>
		<Scroller>
			{#each reshapedItems as {key, values}}
				<div class='valueRow'>
					{#each columnKeys as subKey}
						{@const value = values?.[subKey]}
						<div class='box'>
							<div
								class='square'
								style='
									--width: {computeSquareSize(value)}px;
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
	</div>
{/if}

<style>
	ol {
		counter-reset: li;
		list-style: none;
		padding-left: 0;
	}

	ol li {
		margin-bottom: .5em;
		padding-left: 2.5em;
		position: relative;
	}

	ol li::before {
		border-radius: 50%;
		border: 2px solid white;
		content: counter(li);
		counter-increment: li;
		font-size: .8em;
		height: 1.6em;
		left: 0;
		line-height: 1.6em;
		position: absolute;
		text-align: center;
		width: 1.6em;
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
	.box {
		align-items: end;
		display: flex;
		justify-content: center;
	}
	.square {
		background-color: var(--colorPrimary);
		background: white;
		border: thin solid black;
		height: var(--width);
		width: var(--width);
	}
	.labelRow {
		align-items: center;
		border-top: thin solid lightgrey;
		display: flex;
		justify-content: center;
		margin-bottom: 1em;
		padding-top: 0.75em;
		text-align: center;
	}
</style>
