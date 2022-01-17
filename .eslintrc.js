module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  env: {
      node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:json/recommended-with-comments'
  ],
  ignorePatterns: [
    'index.js'
  ],
  overrides : [
    {
      files: [
        '*.yaml',
        '*.yml'
      ],
      plugins: ['yaml'],
      extends: ['plugin:yaml/recommended']
    }
]
};
