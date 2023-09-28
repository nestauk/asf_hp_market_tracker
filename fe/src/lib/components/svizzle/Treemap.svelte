<script>
	import {makeStyleVars} from '@svizzle/dom';
	import {getKey, getValue} from '@svizzle/utils';
	import {hierarchy, stratify, treemap} from 'd3-hierarchy';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	export let items;
	export let keyAccessor = getKey;
	export let keyToColorFn;
	export let keyToColorLabelFn;
	export let paddingInner = 5;
	export let paddingOuter = 2;
	export let valueAccessor = getValue;

	let treemapHeight;
	let treemapWidth;

	const lineHeight = 20;
	const padding = 5;

	const dispatch = createEventDispatcher();
	const stratifyData = stratify().path(_.identity);

	$: getHierarchy = stratified =>
		hierarchy(stratified)
		.sum(x => x.data ? valueAccessor(x.data) : 0); // root.data = null
	$: getTreeRoot = _.pipe([stratifyData, getHierarchy]);
	$: getTreemap =
		treemap()
		.size([treemapWidth, treemapHeight])
		.paddingOuter(paddingOuter)
		.paddingInner(paddingInner);
	$: treeRoot = getTreeRoot(items);
	$: treemapLeaves = getTreemap(treeRoot).leaves();
	$: textGroup = textGroup || new Array(treemapLeaves.length);
	$: rects = _.map(textGroup, gNode => gNode?.getBBox());
	$: doesTextFit = _.map(
		_.zip(rects, treemapLeaves),
		([rect, {x0, x1, y0, y1}]) => {
			if (!rect) return false;
			return [
				rect.width < x1 - x0 - padding * 2,
				rect.width < y1 - y0 - padding * 2
			];
		}
	);
	$: style = makeStyleVars({
		lineHeight: `${lineHeight}px`,
		padding: `${padding}px`,
	});
</script>

<div
	bind:clientHeight={treemapHeight}
	bind:clientWidth={treemapWidth}
	class='Treemap'
>
	<svg
		height={treemapHeight}
		width={treemapWidth}
		{style}
	>
		{#each treemapLeaves
			as {x0, x1, y0, y1, data: {data}}, i
		}
			<g
				on:mousemove={({x, y}) => dispatch('leafHovered', {data, x, y})}
				on:mouseout={({x, y}) => dispatch('leafExited', {data, x, y})}
				on:touchstart|preventDefault={({targetTouches: [touch]}) => {
					const {clientX: x, clientY: y} = touch;
					dispatch('leafTouchStarted', {data, x, y})
				}}
				on:touchend={() => {
					dispatch('leafTouchEnded', {data})
				}}
				transform='translate({x0},{y0})'
			>
				<rect
					fill={keyToColorFn(keyAccessor(data))}
					height={y1-y0}
					stroke-width={0.5}
					stroke='var(--colorBorderAux)'
					width={x1-x0}
				/>
				<g
					bind:this={textGroup[i]}
					transform={!doesTextFit[i][0] && doesTextFit[i][1]
						? `translate(0,${y1-y0}) rotate(-90)`
						: ''
					}
					class:tooLarge={!doesTextFit[i][0] && !doesTextFit[i][1]}
				>
					<text
						dx={padding}
						dy={padding}
						fill={keyToColorLabelFn(keyAccessor(data))}
						maxHeight={y1-y0}
						maxWidth={x1-x0}
					>{keyAccessor(data)}</text>
					<text
						dx={padding}
						dy={padding + lineHeight}
						fill={keyToColorLabelFn(keyAccessor(data))}
					>{valueAccessor(data)}</text>
				</g>
			</g>
		{/each}
	</svg>
</div>

<style>
	.Treemap {
		height: 100%;
		width: 100%;
		overflow: hidden;
	}

	text {
		dominant-baseline: hanging;
		stroke: none;
	}

	g.tooLarge {
		visibility: hidden;
	}
</style>
