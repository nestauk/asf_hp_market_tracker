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

	import {page as _page} from '$app/stores';
	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import StreamGraph from '$lib/components/svizzle/StreamGraph.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import {_selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {objectToKeyValuesArray} from '$lib/utils/svizzle/utils.js';

	const keyAccessor = _.getKey('key_as_string');
	const valueAccessor = _.getPath('agg2.buckets');
	const keyAccessor2 = getKey;
	const valueAccessor2 = _.getKey('doc_count');

	/* common */

	const keyFormatFn = _.pipe([
		makeSplitBy('-'),
		_.getAt(0),
		sliceStringAt([2, 4])
	]);

	/* streams */

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
	const getStreamsCategs = _.pipe([
		_.flatMapWith(
			_.pipe([getValues, _.mapWith(getKey)])
		),
		_.uniques,
		_.sortWith([])
	]);

	/* trends */

	const getTrends = _.pipe([
		_.flatMapWith(
			({key: xKey, values}) => _.map(values,
				({key, value}) => ({key, xKey, value})
			)
		),
		_.groupBy(getKey),
		_.mapValuesWith(
			_.mapWith(({xKey: key, value}) => ({key, value}))
		),
		objectToKeyValuesArray
	]);

	let categories;
	let categoryToColorFn;
	let doDraw = false;
	let streams;
	let trends;

	// rename key, categs etc

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_viewData?.page.route.id === $_page.route.id;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.agg1.buckets;

		streams = reshapeItems(rawItems);
		categories = getStreamsCategs(streams);

		trends = getTrends(streams);

		const colorScheme = _.map(
			categories,
			(v, index) => interpolateColor(index / (categories.length - 1))
		);
		categoryToColorFn = scaleOrdinal().domain(categories).range(colorScheme);

		doDraw = true;
	}
</script>

<Grid2Rows percents={[10, 90]}>
	<TemporalOptions
		showCategsTimeGraph={true}
		showStreamgraphOptions={true}
	/>
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
			<div class='col1' slot='col1'>
				{#if $_selection.categsTimeGraph === 'streams'}
					<StreamGraph
						{categories}
						{categoryToColorFn}
						{keyFormatFn}
						items={streams}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						sorting={$_selection.streamgraphsSorting}
						theme={$_framesTheme}
						valueFormatFn={Math.round}
					/>

				{:else}
					<Trends
						{keyFormatFn}
						geometry={{
							safetyBottom: 50,
							safetyLeft: 80,
							safetyRight: 80,
							safetyTop: 50,
						}}
						items={trends}
						keyToColorFn={categoryToColorFn}
						keyType='date'
						slot='col1'
						theme={{
							...$_framesTheme,
							curveStroke: $_currThemeVars['--colorBorderAux']
						}}
						valueFormatFn={Math.round}
					/>
				{/if}
			</div>
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

	.col1 {
		height: 100%;
		width: 100%;
	}
</style>

<!--
	TODO: `useRelativeY` option to map total sum in each year to the total height
	like Marimekko to see relative change

	TODO: `stackFlows` option to see absolute values instead of summing them up
-->
