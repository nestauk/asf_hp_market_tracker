<script>
	import {
		arrayMaxWith,
		getKey,
		makeMergeAppliedFnMap,
		mergeObj,
	} from '@svizzle/utils';
	import {scaleLinear} from 'd3-scale';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import Checkboxed from '$lib/components/explorer/Checkboxed.svelte';
	import DismissOrApply from '$lib/components/explorer/DismissOrApply.svelte';
	import FilterPaneBorder
		from '$lib/components/explorer/FilterPaneBorder.svelte';
	import {makeOnKeyDown} from '$lib/components/svizzle/ui/handlers.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {getDocCount, getSelected} from '$lib/utils/getters.js';
	import {getSorters} from '$lib/utils/ordering.js';
	import {areAllFalsyWith} from '$lib/utils/svizzle/utils.js';

	export let categories;
	export let id;

	const dispatch = createEventDispatcher();

	const getMaxDocCount = arrayMaxWith(getDocCount);
	const areAllDeselected = areAllFalsyWith(getSelected);
	const getInputStateCopy = _.pick(['key', 'doc_count', 'selected']);
	const getInputStatesCopy = _.mapWith(getInputStateCopy);

	const makeIsKey = key => _.pipe([getKey, _.is(key)]);
	const makeClearAllBut = key => _.mapWith(
		makeMergeAppliedFnMap({selected: makeIsKey(key)})
	);
	const makeToggleSelected = key => _.mapWith(
		makeMergeAppliedFnMap({selected: _.condition(
			makeIsKey(key),
			_.not(getSelected),
			getSelected
		)})
	);
	const selectAll = _.mapWith(mergeObj({selected: true}));

	$: maxDocCount = getMaxDocCount(categories);
	$: scale = scaleLinear().domain([0, maxDocCount]).range([0, 100]);

	$: sortCategories = getSorters(id).itemsSorter;
	$: getSortedInputsStates = _.pipe([getInputStatesCopy, sortCategories]);
	$: sortedInputStates = getSortedInputsStates(categories);
	$: indexedCats = _.index(categories, getKey);
	$: checkDirty = (key, value) => indexedCats[key].selected !== value;
	$: isDirty = _.someIn(
		sortedInputStates,
		({key, selected}) => checkDirty(key, selected)
	);
	$: isApplyDisabled = areAllDeselected(sortedInputStates);

	/* events */

	const makeOnClick = key => event => {
		if (event.shiftKey) {
			sortedInputStates = selectAll(sortedInputStates);
		} else if (event.altKey) {
			sortedInputStates = makeClearAllBut(key)(sortedInputStates);
		} else {
			sortedInputStates = makeToggleSelected(key)(sortedInputStates);
		}
	};

	const onDismiss = () => {
		sortedInputStates = getSortedInputsStates(categories);
	};
	const onApply = () => {
		dispatch('applied', getInputStatesCopy(sortedInputStates));
	};
</script>

<FilterPaneBorder
	{isDirty}
	isEdited={_.has($_selection.filters, id)}
>
	<div class='CategorySelector'>
		{#each sortedInputStates as {key, selected, doc_count} (key)}
			<span
				class='category'
				class:dirty={checkDirty(key, selected)}
			>
				<Checkboxed
					checked={selected}
					label={key}
					on:click={makeOnClick(key)}
					on:keydown={makeOnKeyDown(makeOnClick(key))}
				>
					<div>
						<div>{key}</div>
						<div class='bar' style:width='{scale(doc_count)}%'/>
					</div>
				</Checkboxed>
			</span>
		{/each}
		{#if isDirty}
			<DismissOrApply
				{isApplyDisabled}
				{onApply}
				{onDismiss}
			/>
		{/if}
	</div>
</FilterPaneBorder>

<style>
	.CategorySelector {
		display: grid;
		grid-auto-flow: row;
	}
	.category {
		align-items: center;
		display: flex;
		margin: 0.5em 0;
	}
	.category:hover {
		background-color: var(--colorBackgroundHover);
	}
	.dirty {
		background-color: var(--colorBackgroundDirty) !important;
	}
	.bar {
		background-color: gray;
		height: 2px;
	}
</style>
