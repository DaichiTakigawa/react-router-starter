import { defineConfig } from 'oxfmt';

export default defineConfig({
  trailingComma: 'all',
  arrowParens: 'always',
  singleQuote: true,
  bracketSpacing: true,
  endOfLine: 'lf',
  semi: true,
  tabWidth: 2,
  sortTailwindcss: {},
  printWidth: 80,
  ignorePatterns: [
    'dist/',
    'build/',
    'coverage/',
    '.react-router/',
    'node_modules/',
    'storybook-static/',
    'pnpm-lock.yaml',
    'pnpm-workspace.yaml',
  ],
});
