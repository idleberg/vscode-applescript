import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
const config = tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended);

export default config;
