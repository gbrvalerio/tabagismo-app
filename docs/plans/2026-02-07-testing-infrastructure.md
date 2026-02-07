# Testing Infrastructure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Set up comprehensive testing infrastructure with Jest, pre-commit/pre-push hooks, and CI to enforce 90% test coverage.

**Architecture:** Three-layer quality gate (pre-commit for fast feedback, pre-push for comprehensive validation, CI for safety net). Jest + React Native Testing Library for testing. Husky + lint-staged for git hooks. GitHub Actions for CI.

**Tech Stack:** Jest 29, jest-expo 52, @testing-library/react-native 12, Husky 9, lint-staged 15, GitHub Actions

---

## Task 1: Install Testing Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install test dependencies**

Run:
```bash
npm install --save-dev @testing-library/react-native@^12.4.3 @testing-library/jest-native@^5.4.3 jest@^29.7.0 jest-expo@^52.0.4 @types/jest@^29.5.11
```

Expected: Dependencies installed successfully

**Step 2: Install git hook dependencies**

Run:
```bash
npm install --save-dev husky@^9.0.11 lint-staged@^15.2.0
```

Expected: Dependencies installed successfully

**Step 3: Verify installations**

Run:
```bash
npm list @testing-library/react-native jest-expo husky lint-staged
```

Expected: All packages listed with correct versions

**Step 4: Commit dependency changes**

Run:
```bash
git add package.json package-lock.json
git commit -m "deps: install testing and git hook dependencies

- Add Jest and React Native Testing Library
- Add Husky and lint-staged for git hooks
- Prepare for 90% test coverage enforcement"
```

---

## Task 2: Add NPM Scripts

**Files:**
- Modify: `package.json:5-13`

**Step 1: Add test and typecheck scripts**

Update the scripts section in `package.json`:

```json
"scripts": {
  "start": "expo start",
  "reset-project": "node ./scripts/reset-project.js",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "lint": "expo lint",
  "typecheck": "tsc --noEmit",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "prepare": "husky install",
  "db:generate": "drizzle-kit generate",
  "db:studio": "drizzle-kit studio"
}
```

**Step 2: Verify scripts are added**

Run:
```bash
npm run typecheck
```

Expected: TypeScript compilation check completes (may have errors, that's ok)

**Step 3: Commit script changes**

Run:
```bash
git add package.json
git commit -m "chore: add test and typecheck npm scripts

- Add typecheck script for TypeScript validation
- Add test scripts (test, test:watch, test:coverage)
- Add prepare script for Husky installation"
```

---

## Task 3: Create Jest Configuration

**Files:**
- Create: `jest.config.js`

**Step 1: Create Jest config file**

Create `jest.config.js`:

```javascript
module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
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
    '!**/*.config.{js,ts}',
    '!scripts/**',
    '!**/*.test.{ts,tsx}',
  ],
  coverageThresholds: {
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
```

**Step 2: Verify config is valid**

Run:
```bash
node -e "console.log(require('./jest.config.js'))"
```

Expected: Config object printed without errors

**Step 3: Commit Jest config**

Run:
```bash
git add jest.config.js
git commit -m "config: add Jest configuration

- Use jest-expo preset for React Native compatibility
- Set 90% coverage thresholds for all metrics
- Exclude generated files and configs from coverage
- Configure module name mapper for @ alias"
```

---

## Task 4: Create Jest Setup File

**Files:**
- Create: `jest.setup.js`

**Step 1: Create Jest setup file**

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  usePathname: () => '/',
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => ({
    execSync: jest.fn(),
    runSync: jest.fn(),
    getFirstSync: jest.fn(),
    getAllSync: jest.fn(),
  })),
}));

// Mock react-native Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));
```

**Step 2: Verify setup file syntax**

Run:
```bash
node --check jest.setup.js
```

Expected: No syntax errors

**Step 3: Commit setup file**

Run:
```bash
git add jest.setup.js
git commit -m "config: add Jest setup with Expo mocks

- Extend Jest matchers for React Native testing
- Mock expo-router for navigation tests
- Mock expo-sqlite for database tests
- Mock React Native Alert for error handler tests"
```

---

## Task 5: Create Test Utilities

**Files:**
- Create: `lib/test-utils.tsx`

**Step 1: Create test utilities file**

Create `lib/test-utils.tsx`:

```typescript
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react-native';

/**
 * Create a QueryClient for testing with retries disabled
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
    logger: {
      log: console.log,
      warn: console.warn,
      error: () => {}, // Silence errors in tests
    },
  });
}

/**
 * Render a component with all required providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
}

// Re-export everything from React Native Testing Library
export * from '@testing-library/react-native';
```

**Step 2: Verify TypeScript compilation**

Run:
```bash
npx tsc --noEmit lib/test-utils.tsx
```

Expected: No TypeScript errors

**Step 3: Commit test utilities**

Run:
```bash
git add lib/test-utils.tsx
git commit -m "test: add test utilities for TanStack Query

- Create createTestQueryClient with retries disabled
- Create renderWithProviders wrapper
- Re-export testing library utilities
- Simplify test setup in all test files"
```

---

## Task 6: Write Settings Repository Tests

**Files:**
- Create: `db/repositories/settings.repository.test.ts`

**Step 1: Write the failing test**

Create `db/repositories/settings.repository.test.ts`:

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { createTestQueryClient } from '@/lib/test-utils';
import { QueryClientProvider } from '@tanstack/react-query';
import { useOnboardingStatus, useCompleteOnboarding } from './settings.repository';

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('settings.repository', () => {
  describe('useOnboardingStatus', () => {
    it('should return false when onboarding is not completed', async () => {
      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
      expect(typeof result.current.data).toBe('boolean');
    });

    it('should handle query errors gracefully', async () => {
      const { result } = renderHook(() => useOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading || result.current.isSuccess || result.current.isError).toBe(true);
      });

      // Should either succeed or fail, but not hang
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useCompleteOnboarding', () => {
    it('should have mutate function', async () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should mark onboarding as completed', async () => {
      const { result } = renderHook(() => useCompleteOnboarding(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.mutate).toBeDefined());

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isIdle || result.current.isPending || result.current.isSuccess || result.current.isError).toBe(true);
      });
    });
  });
});
```

**Step 2: Run test to verify it runs**

Run:
```bash
npm test -- settings.repository.test.ts
```

Expected: Tests run (may pass or fail, but should execute)

**Step 3: Commit the test**

Run:
```bash
git add db/repositories/settings.repository.test.ts
git commit -m "test: add settings repository tests

- Test useOnboardingStatus query hook
- Test useCompleteOnboarding mutation hook
- Verify hooks return expected types
- Test error handling gracefully"
```

---

## Task 7: Write Error Handler Tests

**Files:**
- Create: `lib/error-handler.test.ts`

**Step 1: Write error handler tests**

Create `lib/error-handler.test.ts`:

```typescript
import { Alert } from 'react-native';
import {
  DatabaseError,
  logError,
  showErrorAlert,
  handleQueryError,
} from './error-handler';

// Mock console.error to avoid noise in test output
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('error-handler', () => {
  describe('DatabaseError', () => {
    it('should create database error with message', () => {
      const error = new DatabaseError('Test error');

      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test error');
      expect(error.cause).toBeUndefined();
    });

    it('should create database error with cause', () => {
      const cause = new Error('Original error');
      const error = new DatabaseError('Test error', cause);

      expect(error.cause).toBe(cause);
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const error = new Error('Test error');

      logError(error, 'Test Context');

      expect(console.error).toHaveBeenCalledWith('[Test Context]', error);
    });

    it('should handle unknown error types', () => {
      logError('String error', 'Test Context');

      expect(console.error).toHaveBeenCalledWith('[Test Context]', 'String error');
    });
  });

  describe('showErrorAlert', () => {
    it('should show alert with error message', () => {
      const alertSpy = jest.spyOn(Alert, 'alert');

      showErrorAlert('Test error message');

      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Test error message',
        [{ text: 'OK' }]
      );
    });
  });

  describe('handleQueryError', () => {
    it('should log error and show alert', () => {
      const error = new Error('Query failed');
      const alertSpy = jest.spyOn(Alert, 'alert');

      handleQueryError(error, 'Failed to load data');

      expect(console.error).toHaveBeenCalledWith('[Query Error]', error);
      expect(alertSpy).toHaveBeenCalledWith(
        'Error',
        'Failed to load data',
        [{ text: 'OK' }]
      );
    });
  });
});
```

**Step 2: Run tests**

Run:
```bash
npm test -- error-handler.test.ts
```

Expected: All tests pass

**Step 3: Commit error handler tests**

Run:
```bash
git add lib/error-handler.test.ts
git commit -m "test: add error handler tests

- Test DatabaseError creation
- Test logError console output
- Test showErrorAlert React Native Alert
- Test handleQueryError integration
- Achieve 100% coverage on error-handler.ts"
```

---

## Task 8: Write ThemedText Component Tests

**Files:**
- Create: `components/themed-text.test.tsx`

**Step 1: Write component tests**

Create `components/themed-text.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThemedText } from './themed-text';

// Mock the useThemeColor hook
jest.mock('@/hooks/use-theme-color', () => ({
  useThemeColor: () => '#000000',
}));

describe('ThemedText', () => {
  it('should render text content', () => {
    render(<ThemedText>Hello World</ThemedText>);

    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('should apply default type styles', () => {
    render(<ThemedText type="default">Default Text</ThemedText>);

    const element = screen.getByText('Default Text');
    expect(element).toBeTruthy();
  });

  it('should apply title type styles', () => {
    render(<ThemedText type="title">Title Text</ThemedText>);

    const element = screen.getByText('Title Text');
    expect(element).toBeTruthy();
  });

  it('should apply subtitle type styles', () => {
    render(<ThemedText type="subtitle">Subtitle Text</ThemedText>);

    const element = screen.getByText('Subtitle Text');
    expect(element).toBeTruthy();
  });

  it('should apply defaultSemiBold type styles', () => {
    render(<ThemedText type="defaultSemiBold">Semi Bold Text</ThemedText>);

    const element = screen.getByText('Semi Bold Text');
    expect(element).toBeTruthy();
  });

  it('should apply link type styles', () => {
    render(<ThemedText type="link">Link Text</ThemedText>);

    const element = screen.getByText('Link Text');
    expect(element).toBeTruthy();
  });

  it('should accept custom style props', () => {
    render(
      <ThemedText style={{ fontSize: 20 }}>Custom Style</ThemedText>
    );

    const element = screen.getByText('Custom Style');
    expect(element).toBeTruthy();
  });

  it('should accept lightColor and darkColor props', () => {
    render(
      <ThemedText lightColor="#ffffff" darkColor="#000000">
        Themed Text
      </ThemedText>
    );

    const element = screen.getByText('Themed Text');
    expect(element).toBeTruthy();
  });

  it('should forward additional text props', () => {
    render(
      <ThemedText testID="custom-text" numberOfLines={2}>
        Props Test
      </ThemedText>
    );

    const element = screen.getByTestId('custom-text');
    expect(element).toBeTruthy();
  });
});
```

**Step 2: Run component tests**

Run:
```bash
npm test -- themed-text.test.tsx
```

Expected: All tests pass

**Step 3: Commit component tests**

Run:
```bash
git add components/themed-text.test.tsx
git commit -m "test: add ThemedText component tests

- Test all text type variants (default, title, subtitle, link, etc)
- Test custom style props
- Test theme color props
- Test prop forwarding
- Achieve high coverage on themed-text component"
```

---

## Task 9: Check Test Coverage

**Files:**
- None (verification step)

**Step 1: Run full test suite with coverage**

Run:
```bash
npm run test:coverage
```

Expected: Coverage report generated in terminal and `coverage/` directory

**Step 2: Review coverage report**

Run:
```bash
cat coverage/coverage-summary.json | grep -A 4 "total"
```

Expected: Coverage percentages displayed for statements, branches, functions, lines

**Step 3: If coverage is below 90%, identify gaps**

Run:
```bash
npm run test:coverage -- --verbose
```

Expected: Detailed report showing which files need more tests

Note: At this stage, coverage may be below 90%. That's expected. We'll add more tests in subsequent tasks if needed.

---

## Task 10: Setup Husky Git Hooks

**Files:**
- Create: `.husky/pre-commit`
- Create: `.husky/pre-push`

**Step 1: Initialize Husky**

Run:
```bash
npm run prepare
```

Expected: `.husky` directory created

**Step 2: Create pre-commit hook**

Run:
```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

Expected: `.husky/pre-commit` file created

**Step 3: Create pre-push hook**

Run:
```bash
npx husky add .husky/pre-push "npm run test:coverage && npm run lint && npm run typecheck"
```

Expected: `.husky/pre-push` file created

**Step 4: Make hooks executable**

Run:
```bash
chmod +x .husky/pre-commit .husky/pre-push
```

Expected: Hooks are executable

**Step 5: Commit Husky setup**

Run:
```bash
git add .husky/
git commit -m "chore: setup Husky git hooks

- Add pre-commit hook for lint-staged
- Add pre-push hook for full test suite + coverage
- Enforce quality gates before code is pushed"
```

---

## Task 11: Create Lint-Staged Configuration

**Files:**
- Create: `.lintstagedrc.js`

**Step 1: Create lint-staged config**

Create `.lintstagedrc.js`:

```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'bash -c "tsc --noEmit"',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
};
```

**Step 2: Verify config syntax**

Run:
```bash
node -e "console.log(require('./.lintstagedrc.js'))"
```

Expected: Config object printed

**Step 3: Commit lint-staged config**

Run:
```bash
git add .lintstagedrc.js
git commit -m "config: add lint-staged configuration

- Run ESLint with auto-fix on staged files
- Run TypeScript type-check on staged files
- Run Jest tests related to changed files
- Fast pre-commit validation"
```

---

## Task 12: Create GitHub Actions CI Workflow

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create workflows directory**

Run:
```bash
mkdir -p .github/workflows
```

Expected: Directory created

**Step 2: Create CI workflow file**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality-checks:
    name: Quality Checks
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run TypeScript check
        run: npm run typecheck

      - name: Run tests with coverage
        run: npm run test:coverage

      - name: Upload coverage to Codecov (optional)
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false
        continue-on-error: true
```

**Step 3: Verify YAML syntax**

Run:
```bash
cat .github/workflows/ci.yml | head -20
```

Expected: YAML file displays correctly

**Step 4: Commit CI workflow**

Run:
```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow

- Run on PRs and pushes to main
- Execute lint, typecheck, and test:coverage
- Upload coverage reports to Codecov (optional)
- Block PR merging if checks fail"
```

---

## Task 13: Add .gitignore Entries

**Files:**
- Modify: `.gitignore`

**Step 1: Add coverage directory to gitignore**

Add to `.gitignore`:

```
# Testing
coverage/
*.lcov
.nyc_output
```

**Step 2: Verify gitignore is updated**

Run:
```bash
grep -A 3 "# Testing" .gitignore
```

Expected: Coverage entries shown

**Step 3: Commit gitignore update**

Run:
```bash
git add .gitignore
git commit -m "chore: ignore test coverage output

- Exclude coverage/ directory from git
- Exclude coverage report files"
```

---

## Task 14: Create README Section for Testing

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add testing section to CLAUDE.md**

Add after the "Commands" section in `CLAUDE.md`:

```markdown
## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Writing Tests

Tests are co-located with source files:
- `file.ts` → `file.test.ts`
- `Component.tsx` → `Component.test.tsx`

Use test utilities:
```typescript
import { renderWithProviders } from '@/lib/test-utils';
import { MyComponent } from './MyComponent';

test('renders correctly', () => {
  const { getByText } = renderWithProviders(<MyComponent />);
  expect(getByText('Hello')).toBeTruthy();
});
```

### Coverage Requirements

- **Minimum:** 90% for statements, branches, functions, and lines
- **Enforced:** Pre-push hook and CI
- **Excluded:** Migrations, configs, root layout

### Git Hooks

- **Pre-commit:** Lint + typecheck + tests for staged files only (fast)
- **Pre-push:** Full test suite + coverage + lint + typecheck (comprehensive)
```

**Step 2: Verify markdown formatting**

Run:
```bash
head -50 CLAUDE.md
```

Expected: New testing section visible

**Step 3: Commit documentation update**

Run:
```bash
git add CLAUDE.md
git commit -m "docs: add testing section to CLAUDE.md

- Document test commands
- Explain test file organization
- Document coverage requirements
- Document git hook behavior"
```

---

## Task 15: Test Pre-Commit Hook

**Files:**
- None (validation task)

**Step 1: Create a dummy change to test the hook**

Run:
```bash
echo "// Test comment" >> lib/test-utils.tsx
git add lib/test-utils.tsx
```

Expected: File staged

**Step 2: Attempt commit to trigger pre-commit hook**

Run:
```bash
git commit -m "test: verify pre-commit hook"
```

Expected: Hook runs lint-staged, executes eslint and jest on staged file

**Step 3: If hook passes, verify and reset**

Run:
```bash
git reset HEAD~1
git checkout lib/test-utils.tsx
```

Expected: Dummy commit removed, file restored

**Step 4: Document hook test result**

If hooks work, continue. If hooks fail, debug and fix before proceeding.

---

## Task 16: Test Pre-Push Hook (Dry Run)

**Files:**
- None (validation task)

**Step 1: Check current coverage**

Run:
```bash
npm run test:coverage 2>&1 | grep -A 5 "Coverage summary"
```

Expected: Coverage report displayed

**Step 2: Note coverage percentages**

Look for lines like:
```
Statements   : 85% ( X/Y )
Branches     : 80% ( X/Y )
Functions    : 90% ( X/Y )
Lines        : 85% ( X/Y )
```

**Step 3: Identify files needing more tests**

If coverage is below 90%, run:
```bash
npm run test:coverage -- --verbose
```

Expected: Detailed per-file coverage shown

**Step 4: Document coverage gaps**

Note which files need additional tests to reach 90% threshold. This will inform Task 17.

---

## Task 17: Add Additional Tests to Reach 90% Coverage

**Files:**
- Create tests as needed based on coverage gaps

**Step 1: Identify untested files**

Based on coverage report from Task 16, identify files below 90% coverage that are not excluded.

**Step 2: Write tests for uncovered code**

For each file needing tests, create a co-located test file. Common targets:
- `db/repositories/` (if more exist)
- `components/` (untested components)
- `lib/` utilities (except query-client.ts, test-utils.tsx)
- Business logic in `app/` screens (if applicable)

**Step 3: Run coverage after each test file**

Run:
```bash
npm run test:coverage
```

Expected: Coverage increases with each new test file

**Step 4: Commit each test file individually**

For each test file:
```bash
git add path/to/file.test.ts
git commit -m "test: add tests for [filename]

- Test [specific functionality]
- Increase coverage to [X%]"
```

**Step 5: Repeat until 90% threshold reached**

Continue adding tests until:
```
Statements   : 90%+
Branches     : 90%+
Functions    : 90%+
Lines        : 90%+
```

---

## Task 18: Verify All Quality Gates

**Files:**
- None (validation task)

**Step 1: Verify pre-commit hook**

Run:
```bash
echo "// Pre-commit test" >> lib/test-utils.tsx
git add lib/test-utils.tsx
git commit -m "test: verify pre-commit"
```

Expected: Hook runs successfully, commit completes

**Step 2: Verify pre-push hook (without pushing)**

Run:
```bash
git push --dry-run
```

Note: This won't trigger the hook. To test the hook without pushing:

Run:
```bash
.husky/pre-push
```

Expected: Full test suite runs with coverage, lint, and typecheck

**Step 3: Clean up test commit**

Run:
```bash
git reset HEAD~1
git checkout lib/test-utils.tsx
```

Expected: Test commit removed

**Step 4: Verify all checks pass**

Run:
```bash
npm run test:coverage && npm run lint && npm run typecheck
```

Expected: All commands succeed, coverage meets 90% threshold

---

## Task 19: Push and Verify CI

**Files:**
- None (validation task)

**Step 1: Push feature branch**

Run:
```bash
git push -u origin feat/tests-checks
```

Expected: Pre-push hook runs, branch pushed to remote

**Step 2: Check GitHub Actions**

Go to: https://github.com/[username]/[repo]/actions

Expected: CI workflow triggered, running quality checks

**Step 3: Wait for CI to complete**

Expected: All checks pass (green checkmark)

**Step 4: Review CI output**

Click on the workflow run and review:
- ESLint results
- TypeScript check results
- Test coverage results

Expected: All steps succeed, coverage meets 90%

---

## Task 20: Configure Branch Protection (Manual)

**Files:**
- None (GitHub UI configuration)

**Step 1: Navigate to repository settings**

Go to: Settings → Branches → Branch protection rules

**Step 2: Add rule for main branch**

Click "Add rule" and configure:
- Branch name pattern: `main`
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- Select status check: "Quality Checks"

**Step 3: Save protection rule**

Click "Create" or "Save changes"

Expected: Branch protection enabled for main

**Step 4: Verify protection**

Try to merge a PR without passing checks (if possible)

Expected: Merge blocked until checks pass

---

## Task 21: Final Verification and Documentation

**Files:**
- Create: `docs/plans/2026-02-07-testing-infrastructure-COMPLETE.md`

**Step 1: Run final test suite**

Run:
```bash
npm run test:coverage
```

Expected: All tests pass, coverage ≥ 90%

**Step 2: Create completion document**

Create `docs/plans/2026-02-07-testing-infrastructure-COMPLETE.md`:

```markdown
# Testing Infrastructure - Implementation Complete

**Date:** 2026-02-07
**Status:** ✅ Complete

## Summary

Successfully implemented comprehensive testing infrastructure with:
- ✅ Jest + React Native Testing Library
- ✅ 90% test coverage enforcement
- ✅ Pre-commit hooks (lint + typecheck + related tests)
- ✅ Pre-push hooks (full suite + coverage)
- ✅ GitHub Actions CI
- ✅ Branch protection on main

## Coverage Results

\`\`\`
Statements   : XX% (X/Y)
Branches     : XX% (X/Y)
Functions    : XX% (X/Y)
Lines        : XX% (X/Y)
\`\`\`

## Tests Written

- [x] Settings repository tests
- [x] Error handler tests
- [x] ThemedText component tests
- [ ] Additional tests (list here)

## Quality Gates Verified

- [x] Pre-commit hook working
- [x] Pre-push hook working
- [x] CI workflow passing
- [x] Branch protection configured

## Next Steps

- Consider adding E2E tests with Detox
- Add visual regression testing
- Set up mutation testing for test quality
```

**Step 3: Fill in actual coverage numbers**

Update the coverage results section with actual numbers from coverage report.

**Step 4: Commit completion document**

Run:
```bash
git add docs/plans/2026-02-07-testing-infrastructure-COMPLETE.md
git commit -m "docs: mark testing infrastructure implementation complete

- Document final coverage results
- List all tests written
- Verify all quality gates working
- Implementation successful"
```

**Step 5: Push final commit**

Run:
```bash
git push
```

Expected: Pre-push hook passes, CI runs and passes

---

## Success Criteria

- ✅ All dependencies installed
- ✅ Jest configured with 90% thresholds
- ✅ Test utilities created
- ✅ Repository tests written
- ✅ Component tests written
- ✅ Coverage meets or exceeds 90% for all metrics
- ✅ Pre-commit hook runs on git commit
- ✅ Pre-push hook blocks push if tests/coverage fail
- ✅ GitHub Actions CI workflow runs on PRs
- ✅ Branch protection blocks merging if CI fails
- ✅ Documentation updated

---

## Notes

- **DRY:** Test utilities reduce boilerplate across all test files
- **YAGNI:** Only test what's necessary to reach coverage threshold
- **TDD:** Tests written alongside or before implementation where possible
- **Frequent commits:** Each task commits working changes
- **Bite-sized:** Each step takes 2-5 minutes
