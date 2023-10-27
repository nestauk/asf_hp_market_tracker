<script>
	import {_screen} from '@svizzle/ui';
	// import Bowser from 'bowser';
	import * as _ from 'lamb';
	import {onMount} from 'svelte';

	import A from '$lib/components/mdsvex/a.svelte';
	import H2 from '$lib/components/mdsvex/h2.svelte';
	import Ul from '$lib/components/mdsvex/ul.svelte';
	// import P from '$lib/components/mdsvex/p.svelte';
	import {
		lighthouseUrls,
		toolName,
	} from '$lib/config';
	import {_currThemeVars, _extLinkTheme} from '$lib/stores/theme';
	/*
	import {
		getTest,
		getTestResultsFilename,
		groupTests,
		testResultsBaseURL,
		summarizeResults
	} from '$lib/utils/tests';
	*/

	import Accessibility from '$lib/_content/Accessibility.svx';

	const reportNames = _.keys(lighthouseUrls)

	// let environment;
	/*
	let testResults = {
		tested: false,
		passed: false
	};

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
	*/

	const getLighthouseAuditUrl = (id, theme) =>  `/audits/lighthouse/${id}_${theme}.html`
	const getPa11yAuditUrl = (id, theme) =>  `/audits/pa11y/${id}_${theme}.html`

	onMount(() => {
		// environment = Bowser.parse(window.navigator.userAgent);
		// loadResults(environment);
	})
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

		<H2>Quality audits (lighthouse)</H2>
		<menu class='tabs'>
			<Ul>
				{#each reportNames as id}
					<li>
						{id}:
						<A href={getLighthouseAuditUrl(id, 'themeLight')}>
							light
						</A>
						|
						<A href={getLighthouseAuditUrl(id, 'themeDark')}>
							dark
						</A>
					</li>
				{/each}
			</Ul>
		</menu>

		<H2>Quality audits (Pa11y)</H2>
		<menu class='tabs'>
			<Ul>
				{#each reportNames as id}
					<li>
						{id}:
						<A href={getPa11yAuditUrl(id, 'themeLight')}>
							light
						</A>
						|
						<A href={getPa11yAuditUrl(id, 'themeDark')}>
							dark
						</A>
					</li>
				{/each}
			</Ul>
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

/*
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
*/
</style>
