<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import DevView from '$lib/components/explorer/DevView.svelte';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import {_barchartsTheme} from '$lib/stores/theme.js';
	import {_viewData} from '$lib/stores/view.js';

	let barchartItems;
	let keyToColorFn;
	let doDraw = false;
	let domain;
	let items;

	const accessor = _.getKey('doc_count');
	const filter = _.filterWith(_.pipe([accessor, isNotNil]));
	const makeDomain = _.pipe([_.mapWith(getKey), _.sortWith([]), ]);
	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: accessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: if ($_viewData?.code === 200) {
		items = $_viewData?.data.agg1.buckets;

		domain = makeDomain(items);
		const colorScheme = _.map(
			domain,
			(v, index) => interpolateColor(index / (domain.length - 1))
		);
		keyToColorFn = scaleOrdinal().domain(domain).range(colorScheme);

		barchartItems = makeBarchartItems(items) || [];

		doDraw = true;
	}
</script>

{#if doDraw}
	<Grid2Columns
		percents={[70, 30]}
		gap='0.25em'
	>
		<DevView slot='col0' /> <!-- TODO treemap -->
		<div slot='col1' class='col'>
			<div class='barchart'>
				<BarchartVDiv
					{keyToColorFn}
					items={barchartItems}
					shouldResetScroll={true}
					theme={$_barchartsTheme}
				/>
			</div>
		</div>
	</Grid2Columns>
{/if}

<style>
	.col {
		align-items: center;
		display: flex;
		height: 100%;
		justify-content: center;
		width: 100%;
		padding: 0;
	}
	.barchart {
		width: 100%;
	}
</style>
