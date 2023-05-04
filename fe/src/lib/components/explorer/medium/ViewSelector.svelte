<script>
	import {Link} from '@svizzle/ui';

	import {_activeViewType, _currentMetric} from '$lib/stores/navigation.js';
</script>

<nav class='ViewSelector'>
	<div
		class='target'
		class:selected={$_activeViewType === 'stats'}
	>
		<div class='dot stats'></div>
		<Link
			href='/explorer/{$_currentMetric.type}/stats/{$_currentMetric.id}'
			isBold={$_activeViewType === 'stats'}
		>
			Stats
		</Link>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'geo'}
	>
		<div class='dot region'></div>
		<Link
			href='/explorer/{$_currentMetric.type}/geo/{$_currentMetric.id}'
			isBold={$_activeViewType === 'geo'}
		>
			Geo
		</Link>
	</div>
	<div
		class='target'
		class:selected={$_activeViewType === 'time'}
	>
		<div class='dot date'></div>
		<Link
			href='/explorer/{$_currentMetric.type}/time/{$_currentMetric.id}'
			isBold={$_activeViewType === 'time'}
		>
			Time
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
	.dot {
		border-radius: 50%;
		height: 0.8em;
		margin-right: 0.5em;
		width: 0.8em;
	}
	.dot.stats {
		background-color: var(--colorView1);
	}
	.dot.region {
		background-color: var(--colorView2);
	}
	.dot.date {
		background-color: var(--colorView3);
	}
</style>
