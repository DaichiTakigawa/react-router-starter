/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'es5',
  arrowParens: 'always',
  singleQuote: true,
  bracketSpacing: true,
  endOfLine: 'lf',
  semi: true,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
};

export default config;
