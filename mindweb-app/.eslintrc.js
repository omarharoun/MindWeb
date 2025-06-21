module.exports = {
  extends: ['expo', '@react-native-community'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error'],
    'react-native/no-inline-styles': 'off',
    'react-hooks/exhaustive-deps': 'warn',
  },
  ignorePatterns: ['/dist/*'],
};