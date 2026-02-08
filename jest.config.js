module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.expo/',
    '/coverage/',
    '/.worktrees/', // Exclude git worktrees to avoid duplicate test runs
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  maxWorkers: '50%', // Use half of available CPU cores for better performance
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/.expo/**',
    '!**/dist/**',
    '!app/_layout.tsx',
    '!db/migrations/**',
    '!db/client.ts',
    '!lib/query-client.ts',
    '!hooks/use-color-scheme.ts',
    '!**/*.config.{js,ts}',
    '!scripts/**',
    '!**/*.test.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
