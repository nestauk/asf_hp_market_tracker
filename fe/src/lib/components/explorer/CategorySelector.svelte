<script>
	import {
		getKey,
		makeMergeAppliedFnMap
	} from '@svizzle/utils';
	import * as _ from 'lamb';

	import Checkbox from '$lib/components/explorer/Checkbox.svelte';

	export let categories;
	export let label;

	const getSelected = _.getKey('selected');
	const getInputStateCopy = _.pick(['key', 'doc_count', 'selected']);
	const getInputStatesCopy = _.mapWith(getInputStateCopy);
	const getSortedInputsStates = _.pipe([
		getInputStatesCopy,
		_.sortWith([getKey])
	])

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

	const makeOnClick = key => async e => {
		if (e.altKey) {
			sortedInputStates = makeClearAllBut(key)(sortedInputStates);
		} else {
			sortedInputStates = makeToggleSelected(key)(sortedInputStates);
		}
	};

	const onDismiss = () => {
		sortedInputStates = getSortedInputsStates(categories);
	};
	const onApply = () => {
		categories = getInputStatesCopy(sortedInputStates);
	};

	$: sortedInputStates = getSortedInputsStates(categories);
	$: indexedCats = _.index(categories, getKey);
	$: checkDirty = (key, value) => indexedCats[key].selected !== value;
	$: isDirty = _.someIn(sortedInputStates, ({key, selected}) => checkDirty(key, selected));
</script>

<div class='CategorySelector'>
	{#each sortedInputStates as {key, selected} (key)}
		<span
			class='category'
			class:dirty={checkDirty(key, selected)}
		>
			<Checkbox
				checked={selected}
				label={key}
				on:click={makeOnClick(key)}
			/>
		</span>
	{/each}
	{#if isDirty}
		<div class='buttons'>
			<button
				class='dismiss'
				on:click={onDismiss}
			>
				Dismiss
			</button>
			<button
				class='apply'
				on:click={onApply}
			>
				Apply
			</button>
		</div>
	{/if}
</div>

<style>
	.CategorySelector {
		display: flex;
		flex-wrap: wrap;
		padding: 0.5em;
	}
	.category {
		align-items: center;
		display: flex;
		margin: 0.25em;
		padding: 0.25em;
	}
	.category label, .category input {
		cursor: pointer;
	}
	.category input {
		margin-right: 0.5em;
	}
	.category:hover {
		background-color: var(--colorBackgroundHover);
	}
	.dirty {
		background-color: var(--colorBackgroundDirty) !important;
	}
	.buttons {
		text-align: center;
		width: 100%;
		margin-top: 0.5em;
	}
	button {
		border-color: transparent;
		border-radius: 2em;
		border-width: 0;
		cursor: pointer;
		font-size: 1em;
		padding: 0.5em 1em;
	}
	.dismiss {
		background-color: var(--colorBackgroundDismiss);
		color: var(--colorTextDismiss);
	}
	.apply {
		background-color: var(--colorBackgroundApply);
		color: var(--colorTextApply);
	}
</style>
