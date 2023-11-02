<script>
	import {
		ChevronDown,
		ChevronUp,
		Icon,
		Scroller,
	} from '@svizzle/ui';
	import {
		containsOneOf,
		getKey,
		isIterableEmpty,
		isIterableNotEmpty,
		isTrimmedNotEmpty,
		makeTrimmedSplitBy,
		transformValues,
		trim,
	} from '@svizzle/utils';
	import * as _ from 'lamb';
	import {createEventDispatcher} from 'svelte';

	import FilterPaneBorder
		from '$lib/components/explorer/FilterPaneBorder.svelte';
	import DismissOrApply from '$lib/components/explorer/DismissOrApply.svelte';
	import {makeOnKeyDown} from '$lib/components/svizzle/ui/handlers.js';
	import Input from '$lib/components/svizzle/ui/Input.svelte';
	import {_staticData} from '$lib/stores/data.js';
	import {_selection} from '$lib/stores/navigation.js';
	import {_searchInputTheme} from '$lib/stores/theme.js';

	export let selectedBrandsModels;

	let brands;
	let brandsInput;
	let brandsClause;
	let models;
	let modelsInput;
	let modelsClause;

	const dispatch = createEventDispatcher();

	const toLowerCase = _.invoke('toLowerCase');
	const inputToStrings = _.condition(
		isTrimmedNotEmpty,
		_.pipe([toLowerCase, trim, makeTrimmedSplitBy(/\s+/g)]),
		_.always([])
	);
	const keyContainsOneOf = stringsArray => isIterableEmpty(stringsArray)
		? _.always(true)
		: _.pipe([getKey, toLowerCase, containsOneOf(stringsArray)]);

	const getFromSelection = field => selectedBrandsModels
		? _.find(selectedBrandsModels, _.hasKeyValue('field', field))
		: null;

	const resetSelection = () => {
		brands = getFromSelection('hp_id_brand');
		models = getFromSelection('hp_id_model');

		brandsClause = brands?.clause ? brands.clause : 'include';
		modelsClause = models?.clause ? models.clause : 'include';

		brandsInput = brands?.values?.length ? brands.values.join(' ') : '';
		modelsInput = models?.values?.length ? models.values.join(' ') : '';
	};

	const onApply = () => {
		const allStringsArraysLength = brandsStrings.length + modelsStrings.length;
		const stringsFilters = allStringsArraysLength > 0
			? [
				{
					clause: brandsClause,
					field: 'hp_id_brand',
					values: brandsStrings
				},
				{
					clause: modelsClause,
					field: 'hp_id_model',
					values: modelsStrings
				}
			]
			: [];
		dispatch('apply', stringsFilters);
	};

	$: selectedBrandsModels = selectedBrandsModels?.length
		? selectedBrandsModels
		: [
			{
				clause: 'include',
				field: 'hp_id_brand',
				values: []
			},
			{
				clause: 'include',
				field: 'hp_id_model',
				values: []
			}
		];

	$: selectedBrandsModels, resetSelection();
	$: brandsStrings = inputToStrings(brandsInput);
	$: modelsStrings = inputToStrings(modelsInput);

	$: isDirty =
		brandsClause !== brands?.clause ||
		trim(brandsInput) !== brands?.values.join(' ') ||
		modelsClause !== models?.clause ||
		trim(modelsInput) !== models?.values.join(' ');
	$: isEdited = isIterableNotEmpty($_selection.stringsFilters);

	const getDefaultBrandExpansionsByName = _.pipe([
		_.mapWith(({key}) => [key, {discarded: false, kept: false}]),
		_.fromPairs
	]);
	$: defaultBrandExpansionsByName =
		$_staticData && getDefaultBrandExpansionsByName($_staticData.brandsModels);
	$: brandExpansionsByName = defaultBrandExpansionsByName || {};

	let items = [];
	$: if ($_staticData) {
		const partition = _.pipe([
			_.partitionWith(keyContainsOneOf(brandsStrings)),
			([a, b]) => brandsClause === 'include' ? [a, b] : [b, a],
			_.collect([
				_.pipe([
					_.head,
					_.mapWith(
						transformValues({
							values: _.pipe([
								_.partitionWith(keyContainsOneOf(modelsStrings)),
								([a, b]) => modelsClause === 'include' ? [a, b] : [b, a],
							])
						}),
					)
				]),
				_.last
			])
		]);
		items = partition($_staticData.brandsModels);

		// reset expansions for discardeds

		_.forEach(items[1], ({key}) => {
			brandExpansionsByName[key] = {discarded: false, kept: false}
		});
	}

	const makeToggleExpansion = (brandName, key) => {
		const otherKey = key === 'kept' ? 'discarded' : 'kept';
		const keyValue = brandExpansionsByName[brandName][key];
		const otherKeyValue = brandExpansionsByName[brandName][otherKey];

		/*
		*0 0: 1 0
		*1 0: 0 0
		*0 1: 1 0
		1 1: should never happen
		*/
		const newKeyValue = !keyValue;
		const newOtherValue = otherKeyValue ? !otherKeyValue : otherKeyValue;

		brandExpansionsByName = {
			...brandExpansionsByName,
			...{
				[brandName]: {
					[key]: newKeyValue,
					[otherKey]: newOtherValue
				}
			}
		};
	}
</script>

<FilterPaneBorder
	{isDirty}
	{isEdited}
>
	<div class='BrandsModelsSelector'>

		<!-- brands input -->

		<div class='search'>
			<header>
				<div class='title'>Brands</div>

				<!-- include clause -->
				<div
					aria-label='Include matching brands'
					class:active={brandsClause === 'include'}
					class='button clause'
					on:click={() => {brandsClause = 'include'}}
					on:keydown={makeOnKeyDown(() => {brandsClause = 'include'})}
					role='button'
					tabindex='0'
					title='Include matching brands'
				>
					+
				</div>

				<!-- exclude clause -->
				<div
					aria-label='Exclude matching brands'
					class:active={brandsClause === 'exclude'}
					class='button clause'
					on:click={() => {brandsClause = 'exclude'}}
					on:keydown={makeOnKeyDown(() => {brandsClause = 'exclude'})}
					role='button'
					tabindex='0'
					title='Exclude matching brands'
				>
					-
				</div>
			</header>
			<Input
				bind:value={brandsInput}
				placeholder='e.g. Daik Mits'
				theme={$_searchInputTheme}
			/>
		</div>

		<!-- models input -->

		<div class='search'>
			<header>
				<div class='title'>Models</div>

				<!-- include clause -->
				<div
					aria-label='Include matching models'
					class:active={modelsClause === 'include'}
					class='button clause'
					on:click={() => {modelsClause = 'include'}}
					on:keydown={makeOnKeyDown(() => {brandsClause = 'include'})}
					role='button'
					tabindex='0'
					title='Include matching models'
				>
					+
				</div>

				<!-- exclude clause -->
				<div
					aria-label='Exclude matching models'
					class:active={modelsClause === 'exclude'}
					class='button clause'
					on:click={() => {modelsClause = 'exclude'}}
					on:keydown={makeOnKeyDown(() => {modelsClause = 'exclude'})}
					role='button'
					tabindex='0'
					title='Exclude matching models'
				>
					-
				</div>
			</header>
			<Input
				bind:value={modelsInput}
				placeholder='e.g. Ecod Althe'
				theme={$_searchInputTheme}
			/>
		</div>

		<!-- results -->

		{#if items.length}
			<Scroller>
				<ul class='brands'>

					<!-- kept brands -->

					{#each items[0] as {
						key: brandName,
						values: [keptModels, discardedModels]
					}}
						{@const brandExpansions = brandExpansionsByName[brandName]}
						{@const hasBrandDiscardedModels = isIterableNotEmpty(discardedModels)}
						{@const hasBrandKeptModels = isIterableNotEmpty(keptModels)}
						{@const discardedAction = brandExpansions.kept ? 'Hide' : 'Show'}
						{@const discardedGlyph = brandExpansions.discarded ? ChevronUp : ChevronDown}
						{@const keptGlyph = brandExpansions.kept ? ChevronUp : ChevronDown}
						{@const keptAction = brandExpansions.kept ? 'Hide' : 'Show'}

						<li>
							<!-- brand -->

							<div
								class='brand'
								class:discarded={!hasBrandKeptModels}
							>
								<div class='name'>{brandName}</div>

								<!-- kept button -->
								{#if hasBrandKeptModels}
									<div
										aria-label='{keptAction} included models for this brand'
										class='button kept'
										on:click={makeToggleExpansion(brandName, 'kept')}
										on:keydown={makeOnKeyDown(makeToggleExpansion(brandName, 'kept'))}
										role='button'
										tabindex='0'
										title='{keptAction} included models for this brand'
									>
										<Icon
											glyph={keptGlyph}
											size=20
										/>
									</div>
								{/if}

								<!-- discarded button -->
								{#if hasBrandDiscardedModels}
									<div
										aria-label='{discardedAction} excluded models for this brand'
										class='button discarded'
										on:click={makeToggleExpansion(brandName, 'discarded')}
										on:keydown={makeOnKeyDown(makeToggleExpansion(brandName, 'discarded'))}
										role='button'
										tabindex='0'
										title='{discardedAction} excluded models for this brand'
									>
										<Icon
											glyph={discardedGlyph}
											size=20
										/>
									</div>
								{/if}
							</div>

							<!-- brand's models -->

							<ul class='models'>
								{#if brandExpansions.kept}
									{#each keptModels as {key}}
										<li class='kept'>{key}</li>
									{/each}
								{/if}
								{#if brandExpansions.discarded}
									{#each discardedModels as {key}}
										<li class='discarded'>{key}</li>
									{/each}
								{/if}
							</ul>
						</li>
					{/each}

					<!-- discarded brands -->

					{#each items[1] as {
						key: brandName,
						values: models
					}}
						{@const brandExpansions = brandExpansionsByName[brandName]}
						{@const action = brandExpansions.discarded ? 'Hide' : 'Show'}
						{@const glyph = brandExpansions.discarded ? ChevronUp : ChevronDown}

						<li>

							<!-- brand -->

							<div class='brand discarded'>
								<div class='name'>{brandName}</div>
								<div
									aria-label='{action} models for this brand'
									class='button'
									on:click={makeToggleExpansion(brandName, 'discarded')}
									on:keydown={makeOnKeyDown(makeToggleExpansion(brandName, 'discarded'))}
									role='button'
									tabindex='0'
									title='{action} models for this brand'
								>
									<Icon
										{glyph}
										size=20
									/>
								</div>
							</div>

							<!-- brand's models -->

							{#if brandExpansions.discarded}
								<ul class='models'>
									{#each models as {key}}
										<li class='discarded'>{key}</li>
									{/each}
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</Scroller>
		{/if}

		<!-- confirmation -->

		{#if isDirty}
			<DismissOrApply
				{onApply}
				onDismiss={resetSelection}
			/>
		{/if}

	</div>
</FilterPaneBorder>

<style>
	.BrandsModelsSelector {
		display: grid;
		grid-template-columns: 100%;
		grid-template-rows: min-content min-content 1fr min-content;
		height: 600px;
		width: 100%;
	}

	.button {
		align-items: center;
		border: 1px solid var(--colorBorder);
		cursor: pointer;
		display: flex;
		height: 1.5em;
		justify-content: center;
		line-height: 1;
		padding: 0 0.3em;
		width: 1.5em;
	}

	.search {
		margin-bottom: 1em;
	}
	.search header {
		display: grid;
		gap: 0.25em;
		grid-template-columns: 1fr min-content min-content;
		grid-template-rows: 100%;
	}
	.search header .clause.active {
		background-color: var(--colorClauseActiveBackground);
		color: var(--colorClauseActiveIcon);
	}
	.search header .clause:hover {
		background-color: var(--colorClauseHoverBackground);
		color: var(--colorClauseHover);
	}

	ul {
		list-style-type: none;
	}

	li .brand {
		align-items: center;
		display: flex;
		justify-content: space-between;
		padding: 0.25em 0.5em;
	}
	li .brand .name {
		flex: 1;
	}


	ul.models > li {
		padding: 0.25em 0 0.25em 0.5em;
		margin: 0 0 0.25em 1em;
	}
	ul.models > li:first-child {
		margin-top: 0.25em;
	}

	.button {
		border: thin solid var(--colorBorder);
		cursor: pointer;
	}

	.discarded {
		background-color: var(--colorDiscardedBackground);
		color: var(--colorDiscardedText);
	}
	.kept {
		background-color: var(--colorKeptBackground);
		color: var(--colorKeptText);
	}
</style>
