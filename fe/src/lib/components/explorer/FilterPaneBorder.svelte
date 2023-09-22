<script>
	import {isIterableNotEmpty} from '@svizzle/utils';
	import * as _ from 'lamb';

	import {_selection} from '$lib/stores/navigation.js';

	export let id;
	export let isDirty;

	let isEdited;
	$: if (id === 'installer_geo_region') {
		isEdited = isIterableNotEmpty($_selection.filters.installerRegionNames);
	} else if (id === 'property_geo_region') {
		isEdited = isIterableNotEmpty($_selection.filters.propertyRegionNames);
	} else {
		isEdited = _.has($_selection.filters, id);
	}
</script>

<div
	class='FilterPaneBorder'
	class:edited={isEdited}
	class:dirty={isDirty}
>
	<slot/>
</div>

<style>
	.FilterPaneBorder {
		border: var(--border);
		border-radius: 10px;
		padding: calc(0.75em + 1px);
	}
	.edited {
		border: 2px solid var(--colorBorderAux);
		padding: 0.75em;
	}
	.dirty {
		border: 2px dashed var(--colorBorderAux);
		padding: 0.75em;
	}
</style>
