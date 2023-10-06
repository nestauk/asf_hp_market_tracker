<script>
	import {_screen, Link} from '@svizzle/ui';
	import Bowser from 'bowser';
	import * as _ from 'lamb';
	import {onMount} from 'svelte';

	import H2 from '$lib/components/mdsvex/h2.svelte';
	// import P from '$lib/components/mdsvex/p.svelte';
	import {
		lighthouseUrls,
		toolName,
	} from '$lib/config';
	import {_currThemeVars, _extLinkTheme} from '$lib/stores/theme';
	import {
		getTest,
		getTestResultsFilename,
		groupTests,
		testResultsBaseURL,
		summarizeResults
	} from '$lib/utils/tests';

	import Accessibility from '$lib/_content/Accessibility.svx';

	const reportNames = _.keys(lighthouseUrls)

	let [currentreport] = reportNames;
	let environment;
	let loadingResults = false;
	/*
	let testResults = {
		tested: false,
		passed: false
	};
	*/

	async function loadResults (env) {
		const fileName = getTestResultsFilename(env);
		if (fileName) {
			const response = await fetch(`${testResultsBaseURL}/${fileName}`);
			const allTests = await response.json();
			const indexedResults = groupTests(allTests);
			const test = getTest(indexedResults, env)
			testResults = summarizeResults(test);
		}
	}

	const getAuditUrl = id =>  `/audits/lighthouse/${id}.html`

	onMount(() => {
		environment = Bowser.parse(window.navigator.userAgent);
		loadResults(environment);
	})

	$: {
		currentreport; // eslint-disable-line no-unused-expressions

		loadingResults = true;
	}
</script>

<svelte:head>
	<title>Accessibility - {toolName}</title>
	<meta
		name='description'
		content='All about accessibility in the {toolName}, including a guide on how to enable the accessibility dialog, accessibility audit and other quality audits, plus some pointers to setup various accessibility tools on your system'
	>
</svelte:head>

<main class='accessibility {$_screen?.classes}'>
	<section>
		<Accessibility/>

		<!--
		<H2>Detected Browsing Environment</H2>
		<dl>
			<dt>Platform</dt>
			<dd>{environment?.platform?.type}</dd>
			<dt>Operating System</dt>
			<dd>
				{environment?.os?.name}
				{#if environment?.os?.versionName}
					- {environment.os.versionName}
				{/if}
			</dd>
			<dt>Browser</dt>
			<dd>
				{environment?.browser.name}
				{#if environment?.browser?.version}
					- {environment.browser.version}
				{/if}
			</dd>
			<dt>Engine</dt>
			<dd>
				{environment?.engine.name}
				{#if environment?.engine?.version}
					- {environment.engine.version}
				{/if}
			</dd>
		</dl>

		{#if testResults?.tested}
			<P>
				{#if testResults.passed}
					This browsing environment has been tested and is supported.
				{:else}
					This browsing environment has been tested but some tests
					have failed and it may not be fully supported.
				{/if}
			</P>
		{:else}
			<P>
				This browsing environment hasn't been tested and user experience
				may vary.
				{#if environment?.os?.name === 'Linux'}
					Browserstack does not offer testing under Linux operating
					systems
				{/if}
			</P>
		{/if}
		-->

		<H2>Quality audits</H2>
		<menu class='tabs'>
			<ul>
				{#each reportNames as id}
					<li>
						<Link
							href={getAuditUrl(id)}
						>
							{id}
						</Link>
					</li>
				{/each}
			</ul>
		</menu>
	</section>
</main>

<style>
	.accessibility {
		background-color: var(--colorPageBackground);
		display: flex;
		font-weight: 200;
		height: 100%;
		justify-content: space-around;
		width: 100%;
	}

	section {
		background-color: var(--colorBackground);
		box-shadow: var(--boxShadowY);
		max-width: 900px;
		overflow-y: auto;
		padding: 2rem;
	}

	figure {
		background: var(--colorWarningBackground);
		border: thin solid var(--colorWarningBorder);
		color: var(--colorWarningText);
		padding: 0.5em 1em;
	}

	iframe {
		width: 100%;
	}

	dl {
		display: grid;
		grid-template-rows: repeat(4, auto);
		grid-template-columns: repeat(2, minmax(min-content, max-content));
	}
	dt {
		padding: 0.5em 1em;
		border-top: var(--border);
		color: var(--colorAccentText);
		background: var(--colorAccentBackground);
		text-align: right;
	}
	dt:first-child {
		border-top: none;
	}
	dd {
		border: var(--border);
		padding: 0.5em 1em;
	}
	dd:not(:last-child) {
		border-bottom: none;
	}
</style>
