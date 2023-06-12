<script>
	import * as _ from 'lamb';

	import RangeSlider from '$lib/components/svizzle/RangeSlider.svelte';
	import Scroller from '$lib/components/svizzle/Scroller.svelte';
	import {_staticData} from '$lib/stores/data.js';
	import {_rangeSlidersTheme} from '$lib/stores/theme.js';
	import {_filters} from '$lib/stores/filters.js';
</script>

{#if $_filters}
	<Scroller>
		{#each $_filters as {key: entity, values}, entityIndex}
			<h2>{entity}</h2>
			<ul>
				{#each values as {label, Max, Min}, metricIndex}
					<li>
						<div class='slider'>
							<div>{label}</div>
							<RangeSlider
								{Max}
								{Min}
								bind:max={$_filters[entityIndex].values[metricIndex].max}
								bind:min={$_filters[entityIndex].values[metricIndex].min}
								theme={$_rangeSlidersTheme}
							/>
						</div>
					</li>
				{/each}
			</ul>
		{/each}
	</Scroller>
{/if}

<style>
	h2 {
		padding: 0 1rem 0.7em;
		padding-top: 0.7rem;
	}
	ul {
		list-style-type: none;
	}
	li {
		padding: 0.9em 1.5em;
	}
	li:first-child {
		padding-top: 0;
	}

	.slider {
		overflow: hidden;
		width: 100%;
	}
</style>
