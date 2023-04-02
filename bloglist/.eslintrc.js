module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
    'cypress/globals': true,
  },
  extends: 'airbnb-base',
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  plugins: [
    'react', 'jest', 'cypress',
  ],
  rules: {
    'linebreak-style': 0,
    semi: [
      'error',
      'never',
    ],
    'no-console': 0,
  },
}
