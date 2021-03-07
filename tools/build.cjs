/* eslint-disable @typescript-eslint/no-var-requires */
require('esbuild')
  .build({
    bundle: true,
    entryPoints: ['src/index.ts'],
    external: ['vscode'],
    minify: true,
    outfile: 'lib/extension.js',
    platform: 'node',
    sourcemap: true,
    watch: process.env.NODE_ENV === 'development'
  }).catch(() => process.exit(1))