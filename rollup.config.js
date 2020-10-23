import commonjs from '@rollup/plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";

const plugins = [
  commonjs(),
  filesize(),
  nodeResolve(),
  (
    process.env.NODE_ENV === 'development'
      ? undefined
      : terser()
  ),
  typescript({
    allowSyntheticDefaultImports: true
  })
];

export default [
  {
    external: [
      'child_process',
      'fs',
      'path',
      'os',
      'util',
      'vscode'
    ],
    input: './src/index.ts',
    output: {
      file: './lib/extension.js',
      format: 'cjs'
    },
    plugins: plugins
  }
];
