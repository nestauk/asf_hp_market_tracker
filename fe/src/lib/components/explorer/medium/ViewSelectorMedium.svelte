<script>
	import {Link} from '@svizzle/ui';

	import {
		_activeViewType,
		_currentMetric,
		_searchParams,
	} from '$lib/stores/navigation.js';

	$: ({id, type} = $_currentMetric);
</script>

<nav class='ViewSelector'>
	<div
		class='target'
		class:selected={$_activeViewType === 'geo'}
	>
		<Link
			href='/explorer/{type}/geo/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'geo'}
		>
			Geo
		</Link>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'time'}
	>
		<Link
			href='/explorer/{type}/time/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'time'}
		>
			Time
		</Link>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'stats'}
	>
		<Link
			href='/explorer/{type}/stats/{id}?{$_searchParams}'
			isBold={$_activeViewType === 'stats'}
		>
			Stats
		</Link>
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
