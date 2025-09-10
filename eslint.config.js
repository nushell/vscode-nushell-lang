module.exports = [
  {
    files: ['**/*.ts'], // Apply to all TypeScript files
    languageOptions: {
      parser: require('@typescript-eslint/parser'), // Use TypeScript parser
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },
    rules: {
      // Add your preferred rules here, or start with recommended
      '@typescript-eslint/no-unused-vars': 'warn',
      // Add more rules as needed
    },
  },
];
