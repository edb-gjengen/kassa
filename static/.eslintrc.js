module.exports = {
  env: {
    browser: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: ['plugin:prettier/recommended', 'plugin:import/errors', 'plugin:import/warnings'],
  rules: {
    'no-console': 'off',
    'prefer-destructuring': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['**/*.test.js', '**/*.spec.js', '**/__tests__/**'],
      },
    ],
    'import/prefer-default-export': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
        'newlines-between': 'always',
        alphabetize: { order: 'asc' },
      },
    ],
  },
  plugins: ['prettier'],
};
