import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	deps: {
		alwaysBundle: ['line-column', 'vscode-get-config'],
		neverBundle: ['vscode'],
		onlyAllowBundle: false,
	},
	entry: ['src/index.ts'],
	format: 'cjs',
	minify: true,
	outDir: 'lib',
	platform: 'node',
	target: 'es2020',
});
