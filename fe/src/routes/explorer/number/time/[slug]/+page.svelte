<script>
	import {
		applyFnMap,
		getValue,
		isNotNil,
		makeSplitBy,
		sliceStringAt,
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import Grid2Rows from '$lib/components/svizzle/Grid2Rows.svelte';
	import Trends from '$lib/components/svizzle/trends/Trends.svelte';
	import TemporalOptions
		from '$lib/components/explorer/medium/TemporalOptions.svelte';
	import {_selection} from '$lib/stores/navigation.js';
	import {_currThemeVars, _framesTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';
	import {roundTo1} from '$lib/utils/numbers.js';

	const keyAccessor  = _.getPath('key_as_string');
	const valueAccessor = _.getPath('agg2.avg');
	const reshapeItems = _.mapWith(
		applyFnMap({
			key: keyAccessor,
			value: valueAccessor,
		})
	);
	const filterOutNils = _.filterWith(_.pipe([getValue, isNotNil]));
	const splitByDash = makeSplitBy('-');

	let doDraw = false;
	let items;
	let keyFilterFn;
	let keyFormatFn;

	$: if ($_viewData?.code === 200) {
		const rawItems = $_viewData?.data.agg1.buckets || [];
		const trend = filterOutNils(reshapeItems(rawItems));
		items = [{key: 'trend', values: trend}];

		switch ($_selection.interval) {
			case '1y':
				keyFormatFn = _.pipe([
					splitByDash,
					_.getAt(0),
					sliceStringAt([2, 4])
				]);
				keyFilterFn = null;
				break;
			case '1q':
			case '1M':
				keyFormatFn = _.pipe([
					splitByDash,
					_.getAt(0),
					sliceStringAt([2, 4])
				]);
				keyFilterFn = _.pipe([
					splitByDash,
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
	<TemporalOptions showStreamgraphOptions={false} />

	{#if doDraw}
		<Trends
			{items}
			{keyFilterFn}
			{keyFormatFn}
			geometry={{
				safetyBottom: 50,
				safetyLeft: 80,
				safetyRight: 80,
				safetyTop: 50,
			}}
			keyType='date'
			theme={{
				...$_framesTheme,
				curveStroke: $_currThemeVars['--colorBorderAux']
			}}
			valueFormatFn={roundTo1}
		/>
	{/if}
</Grid2Rows>
