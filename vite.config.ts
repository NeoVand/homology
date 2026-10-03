import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: { host: true },
	build: {
		target: 'es2022',
		// chapters carry their prerendered math (HTML + MathML for screen readers) in JS
		chunkSizeWarningLimit: 3200
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
