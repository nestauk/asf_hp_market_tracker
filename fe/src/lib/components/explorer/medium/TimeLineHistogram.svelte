<script>
	import {setupResizeObserver} from '@svizzle/ui';
	import {getKey} from '@svizzle/utils';
	import {extent} from 'd3-array';
	import {scaleLinear, scaleTime} from 'd3-scale';
	import * as _ from 'lamb';

	import {_staticData} from '$lib/stores/data.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {formatDate} from '$lib/utils/date.js';
	import {getDocCount} from '$lib/utils/getters.js';
	import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

	const geometry = {
		safetyBottom: 0,
		safetyLeft: 40,
		safetyRight: 40,
		safetyTop: 30,
	};

	const {
		_writable: _size,
		resizeObserver: sizeObserver
	} = setupResizeObserver();

	const getTimeDomain = _.pipe([
		pluckKeySorted,
		_.collect([_.take(2), _.last]),
		([[first, second], last]) => [first, last + second - first]
	]);

	let bbox;
	let fontSize;
	let items;
	let rects;
	let xTicks;

	$: ({inlineSize: width, blockSize: height} = $_size);
	$: proceed = height && width && $_staticData?.timelines;
	$: if (proceed) {
		items = $_staticData.timelines[$_selection.interval];

		bbox = {
			blx: geometry.safetyLeft,
			bly: height - geometry.safetyBottom,
			height: height - geometry.safetyTop - geometry.safetyBottom,
			trx: width - geometry.safetyRight,
			try: geometry.safetyTop,
			width: width - geometry.safetyRight - geometry.safetyLeft,
		};

		const timeDomain = getTimeDomain(items);
		const xScale =
			scaleTime()
			.domain(timeDomain)
			.range([0, bbox.width]);

		const barWidth = xScale(getKey(items[1])) - xScale(getKey(items[0]));

		const [, max] = extent(items, getDocCount);
		const yScale = scaleLinear().domain([0, max]).range([0, bbox.height]);

		rects = _.map(items, ({key, doc_count}) => {
			const barHeight = yScale(doc_count);

			return {
				height: barHeight,
				width: barWidth,
				x: xScale(key),
				y: bbox.height - barHeight,
			}
		});

		fontSize = geometry.safetyTop / 2;
		xTicks = _.map(xScale.ticks(), date => ({
			dy: -geometry.safetyTop / 4,
			label: formatDate(date),
			x: xScale(date),
		}));
	}
</script>

<div
	class='TimeLine'
	use:sizeObserver={'contentBoxSize'}
	style='font-size:{fontSize}'
>
	{#if proceed}
		<svg
			{height}
			{width}
		>
			<g transform='translate({bbox.blx},{bbox.try})'>
				<g class='xTicks'>
					{#each xTicks as {dy, label, x}}
						<text
							{dy}
							{x}
						>
							{label}
						</text>
						<line
							x1={x}
							x2={x}
							y1={0}
							y2={bbox.height}
						/>
					{/each}
				</g>

				<g class='bins'>
					{#each rects as {x, y, width, height}}
						<rect
							{height}
							{width}
							{x}
							{y}
						/>
					{/each}
				</g>
			</g>
		</svg>
	{/if}
</div>

<style>
	.TimeLine {
		height: 100%;
		width: 100%;
	}

	.xTicks text {
		fill: var(--colorText);
		stroke: none;
		text-anchor: middle;
	}
	.xTicks line {
		stroke-dasharray: var(--gridStrokeDasharray);
		stroke: var(--colorBorder);
	}

	.bins rect {
		fill: var(--colorTimelineActiveBinFill);
		stroke: var(--colorTimelineActiveBinStroke);
	}
</style>
