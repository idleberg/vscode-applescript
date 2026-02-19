import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	entry: ['src/index.ts'],
	external: ['vscode'],
	format: 'cjs',
	inlineOnly: false,
	minify: true,
	noExternal: ['line-column', 'vscode-get-config'],
	outDir: 'lib',
	platform: 'node',
	target: 'es2020',
});
