import { defineConfig, globalIgnores } from 'eslint/config';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginTanstackQuery from '@tanstack/eslint-plugin-query';
import pluginVitest from '@vitest/eslint-plugin';
import pluginTestingLibrary from 'eslint-plugin-testing-library';
import pluginStorybook from 'eslint-plugin-storybook';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist/**', 'build/**', '.react-router/**', 'node_modules/**']),
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
    extends: [
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat['jsx-runtime'],
      pluginJsxA11y.flatConfigs.recommended,
      pluginReactHooks.configs.flat.recommended,
      pluginTanstackQuery.configs['flat/recommended'],
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
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [
      pluginVitest.configs.recommended,
      pluginTestingLibrary.configs['flat/react'],
    ],
  },
  pluginStorybook.configs['flat/recommended'],
  prettierConfig,
]);
