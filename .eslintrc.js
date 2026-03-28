/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: './tsconfig.json',
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-native',
    'react-hooks',
    'import',
    'prettier',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
    'plugin:prettier/recommended',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { alwaysTryTypes: true },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  rules: {
    // ── Prettier ─────────────────────────────────────────────────────────
    'prettier/prettier': 'error',

    // ── TypeScript ────────────────────────────────────────────────────────
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'warn',
    '@typescript-eslint/prefer-optional-chain': 'warn',
    '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
    '@typescript-eslint/no-require-imports': 'error',

    // ── React ─────────────────────────────────────────────────────────────
    'react/react-in-jsx-scope': 'off', // React 17+ automatic JSX transform
    'react/prop-types': 'off',         // TypeScript handles prop types
    'react/display-name': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // ── React Native ──────────────────────────────────────────────────────
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',  // We use a design-system object
    'react-native/no-raw-text': ['warn', { skip: [] }],
    'react-native/sort-styles': 'off',
    'react-native/split-platform-components': 'off',

    // ── Import ordering ───────────────────────────────────────────────────
    'import/no-duplicates': 'error',
    'import/no-unresolved': 'off',   // TypeScript handles this
    'import/no-cycle': 'warn',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],

    // ── General best practices ────────────────────────────────────────────
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    eqeqeq: ['error', 'always'],
    'prefer-const': 'error',
  },
  overrides: [
    {
      // Relax rules for test files
      files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        'no-console': 'off',
      },
    },
    {
      // Config files use CommonJS require
      files: ['*.config.js', 'babel.config.js', 'metro.config.js', 'jest.config.js'],
      env: { node: true, commonjs: true },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    '.expo/',
    'dist/',
    'build/',
    'coverage/',
    '*.d.ts',
  ],
};
