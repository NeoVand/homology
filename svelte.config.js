import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { katexPreprocess } from './src/lib/katex/preprocess.js';

const base = process.env.BASE_PATH ?? '';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// KaTeX first: it turns \( … \) and \[ … \] in markup into prerendered HTML,
	// before Svelte ever sees the TeX braces.
	preprocess: [katexPreprocess(), vitePreprocess()],
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		paths: {
			base,
			relative: true
		},
		prerender: {
			handleHttpError: 'fail',
			handleMissingId: 'warn'
		}
	},
	compilerOptions: {
		warningFilter: (w) => !['a11y_no_static_element_interactions', 'a11y_click_events_have_key_events'].includes(w.code)
	}
};

export default config;
