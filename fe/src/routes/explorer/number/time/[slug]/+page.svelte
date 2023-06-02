<script>
	import {
		applyFnMap,
		isNotNil,
		makeSplitBy,
		sliceStringAt,
	} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import StatsTrends from '$lib/components/svizzle/trends/StatsTrends.svelte';
	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import {_selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';
	import {formatDate} from '$lib/utils/date.js';

	const keyAccessor  = _.getPath('key_as_string');
	const valueAccessor = _.pipe([
		_.collect([_.getKey('stats'), _.getPath('percentiles.values')]),
		_.apply(_.merge),
		_.skip(['count', 'sum']),
	]);
	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			values: valueAccessor,
		})
	);
	const filterItems = _.filterWith(
		_.pipe([_.getPath('values.avg'), isNotNil])
	);
	const keyFormatFn = _.pipe([
		makeSplitBy('-'),
		_.getAt(0),
		sliceStringAt([2, 4])
	]);

	const areas = [
		['min', '1.0'],
		['1.0', '5.0'],
		['5.0', '25.0'],
		['25.0', '50.0'],
		['50.0', '75.0'],
		['75.0', '95.0'],
		['95.0', '99.0'],
		['99.0', 'max'],
	];
	const colorScheme = _.map(
		areas,
		(v, index) => interpolateColor(index / (areas.length - 1))
	);
	const areaLowKeyToColor =
		scaleOrdinal()
		.domain(_.map(areas, _.head))
		.range(colorScheme);
	const avgTrendColor = 'black';

	const trendLegendItems = [{color: avgTrendColor, label: 'Average'}];
	const areaLegendItems = _.map(
		_.reverse(areas),
		([lowKey, highKey]) => {
			const lowKeyString =
				['min', 'max'].includes(lowKey) ? lowKey : `${lowKey}%`;
			const highKeyString =
				['min', 'max'].includes(highKey) ? highKey : `${highKey}%`;
			const label = `${lowKeyString} - ${highKeyString}`;

			return {
				color: areaLowKeyToColor(lowKey),
				label
			}
		}
	);

	$: proceed =
		$_viewData?.response.code === 200 &&
		$_page.route.id === $_viewData?.page.route.id;

	let doDraw = false;
	let items;

	$: if (proceed) {
		const rawItems = $_viewData?.response.data.date_histogram.buckets || [];
		items = filterItems(reshapeItems(rawItems));

		doDraw = true;
	}
</script>

<div
	class='route'
	style='--avgTrendColor:{avgTrendColor}'
>
<Grid2Rows percents={[10, 90]}>
	<TemporalOptions showStreamgraphOptions={false} />

	{#if doDraw}
		<Grid2Columns
			percents={[15, 85]}
			gap='0.5em'
		>
			<div
				class='legend'
				slot='col0'
			>
				<div class='legendBlock'>
					<h3>Trends</h3>
					<ul>
						{#each trendLegendItems as {color, label}}
							<li>
								<span
									class='dot'
									style='background-color:{color};border:thin solid var(--colorBorder);'
								></span>
								<span>{label}</span>
							</li>
						{/each}
					</ul>
				</div>
				<div class='legendBlock'>
					<h3>Areas</h3>
					<ul>
						{#each areaLegendItems as {color, label}}
							<li>
								<span
									class='dot'
									style='background-color:{color}'
								></span>
								<span>{label}</span>
							</li>
						{/each}
					</ul>
				</div>
			</div>
			<StatsTrends
				{areaLowKeyToColor}
				{items}
				{keyFormatFn}
				config={{areas, trends: ['avg']}}
				geometry={{
					safetyBottom: 50,
					safetyLeft: 80,
					safetyRight: 80,
					safetyTop: 50,
				}}
				keyType='date'
				preformatDate={formatDate}
				slot='col1'
				theme={{
					...$_framesTheme,
					curveStroke: avgTrendColor
				}}
				valueFormatFn={roundTo1}
			/>
		</Grid2Columns>
	{/if}
</Grid2Rows>
</div>

<style>
	.route {
		height: 100%;
		width: 100%;
	}
	.legend {
		align-items: start;
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: space-evenly;
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
	h3 {
		padding: 0.25em;
	}

	.col1 {
		height: 95%;
		width: 100%;
	}
</style>
