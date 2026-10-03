import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	server: { host: true },
	build: {
		target: 'es2022',
		chunkSizeWarningLimit: 1600
	},
	test: {
		include: ['src/**/*.test.ts'],
		environment: 'node'
	}
});
