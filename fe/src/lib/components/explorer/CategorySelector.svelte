<script>
	import {getKey} from '@svizzle/utils';
	import * as _ from 'lamb';

	export let categories;
	export let label;

	const getSelectionMap = _.pipe([
		_.mapWith(_.collect([
			getKey,
			_.getKey('selected')
		])),
		_.fromPairs
	]);
	const makeCheckDirty = map => ({key, selected}) => selected !== map[key];
	const makeOnChange = key => () => selectionMap[key] = !selectionMap[key];
	const makeOnClick = key => e => {
		if (e.altKey) {
			// selectionMap = _.mapValues(selectionMap, () => false);
			for (const akey in selectionMap) {
				selectionMap[akey] = key === akey;
			}
			// selectionMap[key] = true;
			// e.target.checked = true;
			console.log(selectionMap)
			selectionMap = {...selectionMap};
		}
	};

	const onDismiss = () => {
		selectionMap = getSelectionMap(sortedCategories);
	};
	const onApply = () => {
		_.forEach(categories, cat => {
			cat.selected = selectionMap[cat.key];
		});
		sortedCategories = sortedCategories;
	};

	let selectionMap;

	$: sortedCategories = _.sort(categories, [getKey]);
	$: !selectionMap && (selectionMap = getSelectionMap(sortedCategories));
	$: checkDirty = makeCheckDirty(selectionMap);
	$: isDirty = _.someIn(sortedCategories, checkDirty);
</script>

<div class='CategorySelector'>
	{#each sortedCategories as category (category.key)}
		{@const key = category.key}
		{@const id = `${label}-${key}`}
		<span
			class='category'
			class:dirty={checkDirty(category)}
		>
		<!-- on:change={makeOnChange(key)} -->
			<input
				checked={selectionMap[key]}
				on:click|preventDefault={makeOnClick(key)}
				{id}
				type='checkbox'
			/>
			<label for={id}>{key}</label>
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
