import eslint from '@eslint/js';
import pluginTanstackQuery from '@tanstack/eslint-plugin-query';
import pluginVitest from '@vitest/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettierConfig from 'eslint-config-prettier';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
// import pluginRemotion from '@remotion/eslint-plugin';
import pluginImportSort from 'eslint-plugin-simple-import-sort';
import pluginStorybook from 'eslint-plugin-storybook';
import pluginTestingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores([
    'dist/**',
    'build/**',
    '.react-router/**',
    'node_modules/**',
    'storybook-static/**',
    '.agents/**',
    '.claude/**',
  ]),
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
  },
  {
    files: [
      '**/*.{config,cfg}.{js,cjs,mjs,ts}',
      '**/{scripts,tools}/**/*.{js,ts,mjs,cjs}',
      'eslint.config.{js,mjs,ts}',
      'vite.config.{js,ts}',
    ],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat['jsx-runtime'],
      pluginJsxA11y.flatConfigs.recommended,
      pluginReactHooks.configs.flat.recommended,
      pluginTanstackQuery.configs['flat/recommended'],
      // pluginRemotion.flatPlugin,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
      linkComponents: [
        { name: 'Link', linkAttribute: 'to' },
        { name: 'NavLink', linkAttribute: 'to' },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    plugins: {
      'simple-import-sort': pluginImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'warn',
        {
          groups: [
            [
              '^react$',
              '^react\\u0000$',
              '^node:',
              '^@?\\w',
              '^',
              '^\\.',
              '^.+\\+types',
              '^\\u0000',
              '^.+\\.s?css$',
            ],
          ],
        },
      ],
      'simple-import-sort/exports': 'warn',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [
      pluginVitest.configs.recommended,
      pluginTestingLibrary.configs['flat/react'],
    ],
  },
  pluginStorybook.configs['flat/recommended'],
  prettierConfig,
]);
