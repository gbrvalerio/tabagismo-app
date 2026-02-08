module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'bash -c "tsc --noEmit"',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
};
