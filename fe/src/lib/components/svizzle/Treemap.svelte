<script>
	import {getKey, getValue} from '@svizzle/utils';
	import {hierarchy, stratify, treemap} from 'd3-hierarchy';
	import * as _ from 'lamb';

	export let items;
	export let keyAccessor = getKey;
	export let keyToColorFn;
	export let keyToColorLabelFn;
	export let paddingInner = 5;
	export let valueAccessor = getValue;

	let treemapHeight;
	let treemapWidth;

	const stratifyData = stratify().path(_.identity);

	$: getHierarchy = stratified =>
		hierarchy(stratified)
		.sum(x => x.data ? valueAccessor(x.data) : 0); // root.data = null
	$: getTreeRoot = _.pipe([stratifyData, getHierarchy]);
	$: getTreemap =
		treemap()
		.size([treemapWidth, treemapHeight])
		.paddingInner(paddingInner);
	$: treeRoot = getTreeRoot(items);
	$: treemapLeaves = getTreemap(treeRoot).leaves();
</script>

<div
	bind:clientHeight={treemapHeight}
	bind:clientWidth={treemapWidth}
	class='Treemap'
>
	<svg
		height={treemapHeight}
		width={treemapWidth}
	>
		{#each treemapLeaves
			as {x0, x1, y0, y1, data: {data}}}
		}
			<g transform='translate({x0},{y0})'>
				<rect
					height={y1-y0}
					width={x1-x0}
					fill={keyToColorFn(keyAccessor(data))}
				/>
				<text
					dx={5}
					dy={5}
					fill={keyToColorLabelFn(keyAccessor(data))}
				>{keyAccessor(data)}</text>
				<text
					dx={5}
					dy={25}
					fill={keyToColorLabelFn(keyAccessor(data))}
				>{valueAccessor(data)}</text>
			</g>
		{/each}
	</svg>
</div>

<style>
	.Treemap {
		height: 100%;
		width: 100%;
	}

	text {
		dominant-baseline: hanging;
		stroke: none;
	}
</style>
