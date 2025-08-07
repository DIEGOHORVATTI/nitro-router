import js from '@eslint/js'
import parser from '@typescript-eslint/parser'
import plugin from '@typescript-eslint/eslint-plugin'
import prettier from 'eslint-plugin-prettier'
import pluginImport from 'eslint-plugin-import'

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  js.configs.recommended,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser,
    },
    plugins: {
      '@typescript-eslint': plugin,
      prettier,
      import: pluginImport,
    },
    rules: {
      'no-unused-vars': ['off', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'warn',

      'no-use-before-define': 'off',
      'prettier/prettier': 2,
      camelcase: 'off',
      eqeqeq: 'off',
    },
  },
]
