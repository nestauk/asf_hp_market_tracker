<script>
	import * as _ from 'lamb';

	export let isApplyDisabled;
	export let onApply;
	export let onDismiss;
</script>

<div class='DismissOrApply'>
	<button
		class='dismiss'
		on:click={onDismiss}
	>
		Dismiss
	</button>
	<button
		class:disabled={isApplyDisabled}
		class='apply'
		on:click={isApplyDisabled ? null : onApply}
	>
		Apply
	</button>
</div>

<style>
	.DismissOrApply {
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
	.apply.disabled {
		background-color: var(--colorBackgroundApplyDisabled);
		color: var(--colorTextApply);
		cursor: auto;
	}
</style>
