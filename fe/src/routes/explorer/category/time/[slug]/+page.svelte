<script>
	import {
		applyFnMap,
		getKey,
		getValues,
		makeSplitBy,
		sliceStringAt
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import StreamGraph from '$lib/components/svizzle/StreamGraph.svelte';
	import {_selection} from '$lib/stores/navigation.js';
	import {_framesTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo0} from '$lib/utils/numbers';

	let doDraw = false;

	const keyAccessor = _.getKey('key_as_string');
	const valueAccessor = _.getPath('agg2.buckets');
	const keyAccessor2 = getKey;
	const valueAccessor2 = _.getKey('doc_count');

	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			values: _.pipe([
				valueAccessor,
				_.mapWith(applyFnMap({
					key: keyAccessor2,
					value: valueAccessor2
				}))
			])
		})
	);
	const getCategs = _.pipe([
		_.flatMapWith(
			_.pipe([getValues, _.mapWith(getKey)])
		),
		_.uniques,
		_.sortWith([])
	]);

	let categories;
	let categoryToColorFn;
	let items;
	let keyFilterFn;
	let keyFormatFn;

	$: if ($_viewData?.code === 200) {
		const rawItems = $_viewData?.data.agg1.buckets;

		items = reshapeItems(rawItems);
		categories = getCategs(items);

		const colorScheme = _.map(
			categories,
			(v, index) => interpolateColor(index / (categories.length - 1))
		);
		categoryToColorFn = scaleOrdinal().domain(categories).range(colorScheme);

		switch ($_selection.interval) {
			case '1y':
				keyFormatFn = _.pipe([
					makeSplitBy('-'),
					_.getAt(0),
					sliceStringAt([2, 4])
				]);
				keyFilterFn = null;
				break;
			case '1q':
			case '1M':
				keyFormatFn = _.pipe([
					makeSplitBy('-'),
					_.getAt(0),
					sliceStringAt([2, 4])
				]);
				keyFilterFn = _.pipe([
					makeSplitBy('-'),
					_.getAt(1),
					_.is('01')
				]);
				break;
			default:
				break;
		}

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<TemporalOptions showStreamgraphOptions={true}/>
	{#if doDraw}
		<Grid2Columns
			percents={[15, 85]}
			gap='0.5em'
		>
			<div
				class='legend'
				slot='col0'
			>
				<ul>
					{#each categories as category}
						<li>
							<span
								class='dot'
								style='background-color:{categoryToColorFn(category)}'
							></span>
							<span>{category}</span>
						</li>
					{/each}
				</ul>
			</div>
			<StreamGraph
				{categories}
				{categoryToColorFn}
				{items}
				{keyFilterFn}
				{keyFormatFn}
				valueFormatFn={roundTo0}
				geometry={{
					safetyBottom: 50,
					safetyLeft: 80,
					safetyRight: 80,
					safetyTop: 50,
				}}
				slot='col1'
				sorting={$_selection.streamgraphsSorting}
				theme={$_framesTheme}
			/>
		</Grid2Columns>
	{/if}
</Grid2Rows>

<style>
	.legend {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		padding: 0;
	}
	li {
		align-items: center;
		display: flex;
		padding: 0.25em;
	}
	.dot {
		border-radius: 50%;
		margin-right: 0.5em;
		min-height: 1em;
		min-width: 1em;
	}
</style>

<!--
	TODO: `useRelativeY` option to map total sum in each year to the total height
	like Marimekko to see relative change

	TODO: `stackFlows` option to see absolute values instead of summing them up
-->
