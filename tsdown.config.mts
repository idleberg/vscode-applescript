import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	deps: {
		alwaysBundle: ['line-column', 'vscode-get-config'],
		neverBundle: ['vscode'],
		onlyBundle: false,
	},
	entry: ['src/index.ts'],
	format: 'esm',
	minify: true,
	outDir: 'lib',
	outExtensions: () => ({ js: '.js' }),
	platform: 'node',
	target: 'es2020',
});
