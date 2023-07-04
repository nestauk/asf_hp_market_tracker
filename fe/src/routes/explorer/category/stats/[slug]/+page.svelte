<script>
	import {BarchartVDiv} from '@svizzle/barchart';
	import {applyFnMap, getKey, getValue, isNotNil} from '@svizzle/utils';
	import {hsl} from 'd3-color';
	import {scaleOrdinal} from 'd3-scale';
	import {interpolateSpectral as interpolateColor} from 'd3-scale-chromatic';
	import * as _ from 'lamb';

	import {page as _page} from '$app/stores';
	import Grid2Columns from '$lib/components/svizzle/Grid2Columns.svelte';
	import Treemap from '$lib/components/svizzle/Treemap.svelte';
	import {_currentMetric} from '$lib/stores/navigation.js';
	import {_barchartsTheme} from '$lib/stores/theme.js';
	import {_isViewReady, _viewData} from '$lib/stores/view.js';
	import {getDocCount} from '$lib/utils/getters.js';
	import {pluckKeySorted} from '$lib/utils/svizzle/utils.js';

	const valueAccessor = getDocCount;
	const filter = _.filterWith(_.pipe([valueAccessor, isNotNil]));

	/* barchart */

	const makeBarchartItems = _.pipe([
		filter,
		_.mapWith(applyFnMap({key: getKey, value: valueAccessor})),
		_.sortWith([_.sorterDesc(getValue)])
	]);

	$: proceed =
		$_isViewReady &&
		$_currentMetric?.id === $_page.params.slug &&
		$_viewData.page.route.id === $_page.route.id &&
		$_viewData?.response.code === 200;

	let barchartItems;
	let doDraw = false;
	let domain;
	let items;
	let keyToColorFn;
	let keyToColorLabelFn;

	$: if (proceed) {
		items = $_viewData?.response.data.terms?.buckets || [];

		/* colors */

		domain = pluckKeySorted(items);

		const colorScheme = _.map(
			domain,
			(v, index) => interpolateColor(index / (domain.length - 1))
		);
		keyToColorFn = scaleOrdinal().domain(domain).range(colorScheme);

		const colorSchemeLabel = _.map(
			colorScheme,
			color => hsl(color).l > 0.5 ? 'black' : 'white'
		);
		keyToColorLabelFn = scaleOrdinal().domain(domain).range(colorSchemeLabel);

		/* barchart */

		barchartItems = makeBarchartItems(items) || [];

		doDraw = true;
	}
</script>

{#if doDraw}
	<Grid2Columns
		percents={[70, 30]}
		gap='0.5em'
	>
		<div slot='col0' class='col'>
			<div class='treemap'>
				<Treemap
					{items}
					{keyToColorFn}
					{keyToColorLabelFn}
					{valueAccessor}
				/>
			</div>
		</div>
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
	.treemap {
		height: 95%;
		width: 100%;
	}
</style>
