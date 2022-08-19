import logSymbols from 'log-symbols';
import { build } from 'esbuild';

/* eslint-disable @typescript-eslint/no-var-requires */
build({
  bundle: true,
  entryPoints: ['src/index.ts'],
  external: ['vscode'],
  minify: true,
  outfile: 'lib/extension.js',
  platform: 'node',
  sourcemap: true,
  watch: process.env.ESBUILD_WATCH && {
    onRebuild(error) {
      if (error) {
        console.error(`${logSymbols.error} Build failed:`, error.errors.text);
      } else {
        console.log(`${logSymbols.success} Build succeeded`);
      }
    },
  },
}).catch(() => process.exit(1));