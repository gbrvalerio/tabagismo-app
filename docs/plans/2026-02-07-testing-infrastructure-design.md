# Testing Infrastructure Design

**Date:** 2026-02-07
**Status:** Approved
**Author:** AI Assistant

---

## Overview

Implement comprehensive testing infrastructure with Jest, ESLint, TypeScript checks, pre-commit/pre-push hooks, and GitHub Actions CI. Enforce 90% test coverage across all metrics (statements, branches, functions, lines).

---

## Architecture

### Quality Gates Strategy

Three enforcement layers:

1. **Pre-commit (fast feedback)**
   - Runs on `git commit`
   - Only checks staged files
   - Executes: ESLint, TypeScript type-check, Jest tests for changed files
   - No coverage check (keeps commits fast)
   - Takes ~5-15 seconds typically

2. **Pre-push (comprehensive gate)**
   - Runs on `git push`
   - Checks entire codebase
   - Executes: Full test suite with 90% coverage enforcement, lint all files, typecheck all files
   - Blocks push if any check fails
   - Takes ~30-60 seconds (depending on test count)

3. **CI (safety net)**
   - Runs on pull requests and pushes to main
   - Same checks as pre-push
   - Required status check - blocks PR merging
   - Runs in GitHub Actions with test result annotations

### Coverage Requirements

- **Minimum threshold:** 90% for statements, branches, functions, and lines
- **Exclusions:** migrations, config files, root layout, generated code
- **Enforcement:** Pre-push and CI only (not pre-commit)

---

## Technology Stack

### Core Testing

- **Framework:** Jest 29.7.0
- **React Native preset:** jest-expo 52.0.4
- **Testing library:** @testing-library/react-native 12.4.3
- **Matchers:** @testing-library/jest-native 5.4.3

### Git Hooks

- **Hook manager:** Husky 9.0.11
- **Staged file runner:** lint-staged 15.2.0

### Existing Tools

- **Linter:** ESLint (expo lint)
- **Type checker:** TypeScript 5.9.2
- **CI:** GitHub Actions

---

## Package Dependencies

### New DevDependencies

```json
{
  "devDependencies": {
    "@testing-library/react-native": "^12.4.3",
    "@testing-library/jest-native": "^5.4.3",
    "jest": "^29.7.0",
    "jest-expo": "^52.0.4",
    "@types/jest": "^29.5.11",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.0"
  }
}
```

### Updated Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "lint": "expo lint",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "prepare": "husky install"
  }
}
```

**Script descriptions:**
- `typecheck`: Runs TypeScript compiler in check-only mode
- `test`: Runs all tests
- `test:watch`: Interactive watch mode for development
- `test:coverage`: Generates coverage report (used in pre-push and CI)
- `prepare`: Auto-installs Husky hooks after `npm install`

---

## Configuration Files

### Jest Configuration

**File: `jest.config.js`**

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

**Key settings:**
- Uses `jest-expo` preset for React Native/Expo compatibility
- Excludes generated files, configs, and boilerplate from coverage
- Enforces 90% threshold globally across all metrics
- Maps `@/` alias to project root

### Jest Setup

**File: `jest.setup.js`**

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
}));

// Mock expo-sqlite
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(),
}));
```

**Purpose:**
- Extends Jest matchers for React Native testing
- Mocks Expo modules that don't work in Jest environment
- Provides common test utilities

### Lint-staged Configuration

**File: `.lintstagedrc.js`**

```javascript
module.exports = {
  '*.{ts,tsx}': [
    'eslint --fix',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
};
```

**Behavior:**
- Runs ESLint with auto-fix on staged TypeScript files
- Runs Jest tests related to changed files
- `--bail` stops on first test failure
- `--passWithNoTests` allows commits when no tests exist yet

### Husky Hooks

**Setup commands:**

```bash
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
npx husky add .husky/pre-push "npm run test:coverage && npm run lint && npm run typecheck"
```

**Pre-commit flow:**
1. Developer runs `git commit`
2. Husky triggers lint-staged
3. For each staged `.ts` or `.tsx` file:
   - ESLint runs and auto-fixes issues
   - Jest runs tests related to that file
4. If all pass, commit proceeds
5. If any fail, commit is blocked

**Pre-push flow:**
1. Developer runs `git push`
2. Husky runs: `test:coverage && lint && typecheck`
3. Executes full test suite with 90% coverage check
4. Runs ESLint on all files
5. Runs TypeScript compiler check
6. If all pass, push proceeds
7. If any fail (including coverage < 90%), push is blocked

---

## GitHub Actions CI

### Workflow Configuration

**File: `.github/workflows/ci.yml`**

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

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false
```

### GitHub Repository Settings

**Branch protection rules for `main` (manual setup required):**

Go to Settings → Branches → Branch protection rules:
- ✅ Require status checks to pass before merging
- ✅ Select: "Quality Checks" as required check
- ✅ Require branches to be up to date before merging

**Effect:**
- No PR can merge if tests fail
- No PR can merge if coverage drops below 90%
- No PR can merge if linting fails
- No PR can merge if TypeScript errors exist

---

## Test Organization

### File Structure

Tests are **co-located** with source files:

```
/db
  /repositories
    users.repository.ts
    users.repository.test.ts      # ← Test here
/components
  Button.tsx
  Button.test.tsx                  # ← Test here
/app
  /(tabs)
    index.tsx
    index.test.tsx                 # ← Test here
/lib
  /test-utils.tsx                  # ← Shared test helpers
```

### Naming Convention

- Test files: `{filename}.test.{ts,tsx}`
- Co-located with source file
- Clear 1:1 mapping between source and test

---

## Testing Patterns

### What to Test

1. **Repositories** (in `/db/repositories`)
   - Query logic
   - Mutations
   - TanStack Query integration
   - Error handling

2. **Components** (in `/components`)
   - Rendering with different props
   - User interactions (press, input, etc.)
   - Conditional rendering
   - Accessibility

3. **Utilities** (in `/lib`)
   - Pure functions
   - Edge cases
   - Error handling

### Example Tests

#### Repository Test

**File: `/db/repositories/settings.repository.test.ts`**

```typescript
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSettings, useUpdateOnboardingStatus } from './settings.repository';

// Wrapper for hooks that use TanStack Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('settings.repository', () => {
  describe('useSettings', () => {
    it('should fetch settings successfully', async () => {
      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBeDefined();
    });
  });

  describe('useUpdateOnboardingStatus', () => {
    it('should update onboarding status', async () => {
      const { result } = renderHook(() => useUpdateOnboardingStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.mutate).toBeDefined());

      result.current.mutate({ completed: true });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    });
  });
});
```

#### Component Test

**File: `/components/Button.test.tsx`**

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button onPress={onPress}>Click me</Button>);

    fireEvent.press(screen.getByText('Click me'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText('Click me');

    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
```

### Test Utilities

**File: `/lib/test-utils.tsx`**

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};
```

**Usage:**

```typescript
import { renderWithProviders } from '@/lib/test-utils';

test('component with providers', () => {
  renderWithProviders(<MyComponent />);
  // assertions...
});
```

---

## Implementation Plan

### Phase 1: Setup Infrastructure

1. Install dependencies
2. Create Jest configuration files
3. Create test utilities
4. Setup Husky hooks
5. Create GitHub Actions workflow
6. Configure branch protection

### Phase 2: Write Initial Tests

1. Test repositories (highest priority for coverage)
2. Test reusable components
3. Test utility functions
4. Add tests for screens (if needed for coverage)

### Phase 3: Validation

1. Run tests locally: `npm run test:coverage`
2. Verify coverage meets 90% threshold
3. Test pre-commit hook with sample commit
4. Test pre-push hook with sample push
5. Create test PR to verify CI workflow

---

## Coverage Strategy

### What's Excluded

- `/app/_layout.tsx` - Root layout/providers (boilerplate)
- `/db/migrations/*` - Generated migration files
- `/db/client.ts` - SQLite connection setup
- `/lib/query-client.ts` - TanStack Query config
- `*.config.js` files - Configuration files
- `/scripts/*` - Build/utility scripts
- Test files themselves

### What Needs 90% Coverage

- `/db/repositories/*` - Data access layer
- `/components/*` - Reusable UI components
- `/lib/*` (except test-utils and query-client) - Utilities
- Business logic in `/app` screens (if applicable)

### Achieving 90% Coverage

Focus test efforts on:
1. **Repositories** - Test all queries, mutations, error paths
2. **Components** - Test rendering, interactions, conditional logic
3. **Utilities** - Test edge cases, error handling
4. **Error boundaries** - Test error states and fallbacks

The 90% threshold ensures:
- All critical paths are tested
- Error handling is validated
- Edge cases are covered
- Refactoring is safe

---

## Benefits

1. **Code Quality**
   - 90% test coverage ensures reliability
   - TypeScript catches type errors
   - ESLint enforces style consistency

2. **Developer Experience**
   - Fast pre-commit feedback (5-15 seconds)
   - Comprehensive pre-push validation
   - CI catches issues before code review

3. **Confidence**
   - Safe refactoring with test suite
   - No broken code reaches main branch
   - Coverage metrics track quality over time

4. **Team Alignment**
   - Automated enforcement (no manual reviews needed)
   - Clear quality standards (90% coverage)
   - Consistent code style

---

## Trade-offs

### Pros

- ✅ Strict quality enforcement (90% coverage)
- ✅ Fast commit feedback (only staged files)
- ✅ Prevents broken code from being pushed
- ✅ Industry-standard tools (Jest, Husky, GitHub Actions)
- ✅ Co-located tests (easy to maintain)

### Cons

- ⚠️ Initial setup time to write tests
- ⚠️ Pre-push can be slow (~30-60s) with large test suite
- ⚠️ 90% coverage may be challenging initially
- ⚠️ Developers need to learn testing patterns

### Mitigations

- Pre-commit stays fast (only changed files)
- Coverage requirement enforced gradually
- Test utilities reduce boilerplate
- Examples provided for common patterns

---

## Success Criteria

1. ✅ All dependencies installed
2. ✅ Jest configured with 90% thresholds
3. ✅ Pre-commit hook runs ESLint + tests for staged files
4. ✅ Pre-push hook runs full suite with coverage
5. ✅ GitHub Actions CI blocks PRs on failure
6. ✅ Branch protection requires CI to pass
7. ✅ At least 90% coverage on statements, branches, functions, lines
8. ✅ Example tests for repositories and components

---

## Future Enhancements

- **E2E Testing:** Add Detox or Maestro for end-to-end flows
- **Visual Regression:** Screenshot testing for UI components
- **Performance Testing:** Add benchmarks for critical paths
- **Mutation Testing:** Verify test quality with Stryker
- **Coverage Trends:** Track coverage over time in CI
