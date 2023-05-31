<script>
	import * as _ from 'lamb';

	export let domain;
	export let items;

	const maxSize = 8;
	const computeSquareSize = value => maxSize * Math.sqrt(value / maxValue || 0);

	let columnLabels;
	let maxValue = domain[1];

	$: if (items) {
		columnLabels = _.pipe([
			_.mapWith(_.getKey('key')),
			_.sortWith([])
		])(items);
	}
</script>

<ol>
	{#each columnLabels as columnLabel}
		<li>{columnLabel}</li>
	{/each}
</ol>

<div class='grid' style='--columns: {columnLabels.length}; --maxSize: {maxSize}px;'>
	{#each items as {key, values}}
		<div class='valueRow'>
			{#each values as {subkey, value}}
				<div
					class='square'
					style='--width: {computeSquareSize(value)}px'
				/>
			{/each}
		</div>
		<div class='labelRow'>
			{key}
		</div>
	{/each}
</div>

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
