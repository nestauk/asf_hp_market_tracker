import {dirname, join} from 'path';
import {fileURLToPath} from 'url';

import adapterAuto from '@sveltejs/adapter-auto';
import adapterNetlify from '@sveltejs/adapter-netlify';
import {mdsvex} from 'mdsvex';

import {unescape_code} from './src/lib/utils/unescape-inlineCode.js';

// https://github.com/sveltejs/language-tools/issues/1665
const __dirname = dirname(fileURLToPath(import.meta.url));
const mdsvexLayout = join(__dirname, 'src/lib/components/mdsvex/_layout.svelte');

// eslint-disable-next-line no-process-env
const adapter = process.env.ADAPTER === 'netlify'
	? adapterNetlify({
		edge: false,
		split: false
	})
	: adapterAuto();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx', '.md'],
	kit: {adapter},
	preprocess: [
		mdsvex({
			layout: mdsvexLayout,
			extensions: ['.svx', '.md'],
			remarkPlugins: [unescape_code]
		})
	]
};

export default config;
