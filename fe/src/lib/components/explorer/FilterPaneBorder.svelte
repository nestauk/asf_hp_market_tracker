<script>
	export let isDirty = false;
	export let isEdited = false;
</script>

<div
	class:dirty={isDirty}
	class:edited={isEdited}
	class='FilterPaneBorder'
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
