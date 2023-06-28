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
	const toggle = key => selectionMap[key] = !selectionMap[key];

	const onDismiss = () => {
		selectionMap = getSelectionMap(categories);
	};
	const onApply = () => {
		_.forEach(categories, cat => {
			cat.selected = selectionMap[cat.key];
		});
		categories = categories;
	};

	let selectionMap;

	$: sortedCategories = _.sort(categories, [getKey]);
	$: !selectionMap && (selectionMap = getSelectionMap(categories));
	$: checkDirty = makeCheckDirty(selectionMap);
	$: isDirty = _.someIn(categories, checkDirty);
</script>

<div class='CategorySelector'>
	{#each sortedCategories as category}
		{@const key = category.key}
		{@const id = `${label}-${key}`}
		<span
			class='category'
			class:dirty={checkDirty(category)}
		>
			<input
				checked={selectionMap[key]}
				on:change={toggle(key)}
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
