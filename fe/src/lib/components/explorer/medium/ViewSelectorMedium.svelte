<script>
	import {HyperLink} from '@svizzle/ui';

	import {
		_activeViewType,
		_currentMetric,
		_searchParams,
	} from '$lib/stores/navigation.js';
	import {_linkTheme3} from '$lib/stores/theme.js';

	$: ({id, type} = $_currentMetric);
</script>

<nav class='ViewSelector'>
	<div
		class='target'
		class:selected={$_activeViewType === 'geo'}
	>
		<HyperLink
			href='/explorer/{type}/geo/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'geo'}
			theme={$_linkTheme3}
		>
			Geo
		</HyperLink>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'time'}
	>
		<HyperLink
			href='/explorer/{type}/time/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'time'}
			theme={$_linkTheme3}
		>
			Time
		</HyperLink>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'stats'}
	>
		<HyperLink
			href='/explorer/{type}/stats/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'stats'}
			theme={$_linkTheme3}
		>
			Stats
		</HyperLink>
	</div>
</nav>

<style>
	.ViewSelector {
		align-items: center;
		display: flex;
		height: 100%;
	}
	.target {
		align-items: center;
		display: flex;
		padding: 0.25em 0.5em;
	}
	.target:not(:last-child) {
		margin-right: 1em;
	}
	.target.selected {
		background-color: var(--colorSelectedBackground);
		color: var(--colorSelectedText);
	}
</style>
