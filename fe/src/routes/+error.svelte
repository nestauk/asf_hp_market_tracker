<script>
	import {CenteredView, Scroller} from '@svizzle/ui';

	import {page as _page} from '$app/stores';
	import {toolName} from '$lib/config';
	import {isDev} from '$lib/env';

	// eslint-disable-next-line prefer-destructuring
	$: status = $_page.status;

	// eslint-disable-next-line prefer-destructuring
	$: error = $_page.error;
</script>

<svelte:head>
	<title>{toolName}: {status}</title>
	<meta
		content='Something went wrong, sorry!'
		name='description'
	>
</svelte:head>

<CenteredView
	backgroundColor='var(--backgroundColor)'
	color='var(--colorText)'
>
	<h1>{status}: {error?.message || 'Message not defined'}</h1>

	<!-- TODO make this generic for all error codes -->
	{#if status === 404}
		<p>The page you navigated to doesn't seem to exist.</p>
	{/if}

	{#if isDev && error?.stack}
		<div class='stack'>
			<Scroller>
				<pre>{error?.stack}</pre>
			</Scroller>
		</div>
	{/if}
</CenteredView>

<style>
	.stack {
		max-height: 15em;
	}
</style>
