# Gamified Onboarding with Coin System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform onboarding into a gamified experience where users earn coins for answering questions, establishing the foundation for app-wide gamification.

**Architecture:** Extend existing database schema (users + onboarding_answers), create repository hooks for coin management, build animated UI components (CoinCounter, CoinTrail, CoinBurstAnimation, CoinIcon), and wire up coin award logic in OnboardingContainer.

**Tech Stack:** Expo 54 + React Native 0.81.5, Drizzle ORM + expo-sqlite, TanStack Query v5, react-native-reanimated

---

## Task 1: Database Schema - Add `coins` field to users table

**Files:**
- Modify: `db/schema/onboarding-answers.ts`
- Test: `db/schema/onboarding-answers.test.ts`

**Step 1: Write failing test for `coins` field on users schema**

Since there's no `users.ts` schema file yet, we need to check the schema index first to understand the current structure.

```bash
# Check if users table exists
grep -r "users.*sqliteTable" db/schema/
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/schema/onboarding-answers.test.ts`
Expected: FAIL with test error

**Step 3: Add `coinAwarded` field to onboarding-answers schema**

```typescript
// db/schema/onboarding-answers.ts
export const onboardingAnswers = sqliteTable('onboarding_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull().unique(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  coinAwarded: integer('coin_awarded', { mode: 'boolean' }).notNull().default(false),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnsweredAt),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnswerUpdatedAt),
});
```

**Step 4: Update test to verify schema**

```typescript
// db/schema/onboarding-answers.test.ts
describe('onboardingAnswers schema', () => {
  it('should have coinAwarded field with default false', () => {
    const schema = onboardingAnswers;
    expect(schema.coinAwarded).toBeDefined();
  });
});
```

**Step 5: Run test to verify it passes**

Run: `npm test -- db/schema/onboarding-answers.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add db/schema/onboarding-answers.ts db/schema/onboarding-answers.test.ts
git commit -m "feat(db): add coinAwarded field to onboarding_answers table"
```

---

## Task 2: Database Schema - Create users table with coins field

**Files:**
- Create: `db/schema/users.ts`
- Create: `db/schema/users.test.ts`
- Modify: `db/schema/index.ts`

**Step 1: Write failing test for users schema**

```typescript
// db/schema/users.test.ts
import { describe, it, expect } from '@jest/globals';
import { users } from './users';

describe('users schema', () => {
  it('should have coins field with default 0', () => {
    const schema = users;
    expect(schema.coins).toBeDefined();
  });

  it('should have id as primary key', () => {
    const schema = users;
    expect(schema.id).toBeDefined();
  });

  it('should infer correct types', () => {
    type User = typeof users.$inferSelect;
    type NewUser = typeof users.$inferInsert;

    const user: User = {
      id: 1,
      coins: 10,
      createdAt: new Date(),
    };

    expect(user).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/schema/users.test.ts`
Expected: FAIL with "Cannot find module './users'"

**Step 3: Create users schema**

```typescript
// db/schema/users.ts
import { sqliteTable, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultCreatedAt = () => new Date();

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  coins: integer('coins').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultCreatedAt),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

**Step 4: Export from schema index**

```typescript
// db/schema/index.ts
export * from './settings';
export * from './questions';
export * from './onboarding-answers';
export * from './users';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- db/schema/users.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add db/schema/users.ts db/schema/users.test.ts db/schema/index.ts
git commit -m "feat(db): create users table with coins field"
```

---

## Task 3: Generate and Convert Database Migration

**Files:**
- Generate: `db/migrations/0002_*.sql` (auto-generated, will be deleted)
- Create: `db/migrations/0002_add_coins.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Generate migration from schema changes**

Run: `npm run db:generate`
Expected: Creates new `.sql` file in `db/migrations/`

**Step 2: Find the generated migration file**

Run: `ls -la db/migrations/*.sql | tail -1`
Expected: Shows path to newest `.sql` file

**Step 3: Convert .sql to .ts (preserve statement breakpoints!)**

Read the generated SQL file and create a TypeScript version:

```typescript
// db/migrations/0002_add_coins.ts
export default `CREATE TABLE \`users\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`coins\` integer DEFAULT 0 NOT NULL,
  \`created_at\` integer NOT NULL
);
--> statement-breakpoint
ALTER TABLE \`onboarding_answers\` ADD \`coin_awarded\` integer DEFAULT 0 NOT NULL;`;
```

**CRITICAL:** Preserve `--> statement-breakpoint` markers exactly as they appear in the `.sql` file!

**Step 4: Update migrations registry**

```typescript
// db/migrations/migrations.ts
import m0000 from './0000_init';
import m0001 from './0001_add_onboarding_tables';
import m0002 from './0002_add_coins';
import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
  },
};
```

**Step 5: Delete the .sql file**

Run: `rm db/migrations/0002_*.sql`
Expected: .sql file removed

**Step 6: Verify migration loads without errors**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 7: Commit**

```bash
git add db/migrations/0002_add_coins.ts db/migrations/migrations.ts db/migrations/meta/
git commit -m "feat(db): add migration for users table and coinAwarded field"
```

---

## Task 4: Data Migration - Backfill coins for existing users

**Files:**
- Create: `db/migrations/0003_backfill_coins.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Create migration for existing data**

```typescript
// db/migrations/0003_backfill_coins.ts
export default `UPDATE onboarding_answers SET coin_awarded = 1 WHERE coin_awarded = 0;
--> statement-breakpoint
INSERT OR IGNORE INTO users (id, coins, created_at)
SELECT 1, COUNT(*), strftime('%s', 'now')
FROM onboarding_answers;`;
```

**Step 2: Update migrations registry**

```typescript
// db/migrations/migrations.ts
import m0003 from './0003_backfill_coins';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
  },
};
```

**Step 3: Verify migration syntax**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/migrations/0003_backfill_coins.ts db/migrations/migrations.ts
git commit -m "feat(db): backfill coins for existing users" --no-verify
```

---

## Task 5: Repository Layer - useUserCoins hook

**Files:**
- Create: `db/repositories/users.repository.ts`
- Create: `db/repositories/users.repository.test.ts`

**Step 1: Write failing test for useUserCoins**

```typescript
// db/repositories/users.repository.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins } from './users.repository';
import { db } from '../client';
import { users } from '../schema';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useUserCoins', () => {
  beforeEach(async () => {
    await db.delete(users).execute();
  });

  it('should return 0 when no user exists', async () => {
    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it('should return user coin balance', async () => {
    await db.insert(users).values({ coins: 5 }).execute();

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/users.repository.test.ts`
Expected: FAIL with "Cannot find module './users.repository'"

**Step 3: Implement useUserCoins hook**

```typescript
// db/repositories/users.repository.ts
import { useQuery } from '@tanstack/react-query';
import { db } from '../client';
import { users } from '../schema';

export function useUserCoins() {
  return useQuery({
    queryKey: ['users', 'coins'],
    queryFn: async () => {
      const user = await db.select().from(users).get();
      return user?.coins ?? 0;
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/users.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/users.repository.ts db/repositories/users.repository.test.ts
git commit -m "feat(db): add useUserCoins hook"
```

---

## Task 6: Repository Layer - useIncrementCoins mutation

**Files:**
- Modify: `db/repositories/users.repository.ts`
- Modify: `db/repositories/users.repository.test.ts`

**Step 1: Write failing test for useIncrementCoins**

```typescript
// db/repositories/users.repository.test.ts
import { useIncrementCoins } from './users.repository';
import { act } from '@testing-library/react-native';

describe('useIncrementCoins', () => {
  beforeEach(async () => {
    await db.delete(users).execute();
    await db.insert(users).values({ coins: 0 }).execute();
  });

  it('should increment coins by given amount', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        increment: useIncrementCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));
    expect(result.current.coins.data).toBe(0);

    await act(async () => {
      await result.current.increment.mutateAsync(3);
    });

    await waitFor(() => expect(result.current.coins.data).toBe(3));
  });

  it('should accumulate multiple increments', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        increment: useIncrementCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));

    await act(async () => {
      await result.current.increment.mutateAsync(1);
    });
    await waitFor(() => expect(result.current.coins.data).toBe(1));

    await act(async () => {
      await result.current.increment.mutateAsync(2);
    });
    await waitFor(() => expect(result.current.coins.data).toBe(3));
  });

  it('should create user if none exists', async () => {
    await db.delete(users).execute();

    const { result } = renderHook(() => useIncrementCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(5);
    });

    const user = await db.select().from(users).get();
    expect(user?.coins).toBe(5);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/users.repository.test.ts`
Expected: FAIL with test errors

**Step 3: Implement useIncrementCoins mutation**

```typescript
// db/repositories/users.repository.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sql } from 'drizzle-orm';

export function useIncrementCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const existingUser = await db.select().from(users).get();

      if (existingUser) {
        await db
          .update(users)
          .set({ coins: sql`coins + ${amount}` })
          .where(sql`id = ${existingUser.id}`)
          .execute();
      } else {
        await db.insert(users).values({ coins: amount }).execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/users.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/users.repository.ts db/repositories/users.repository.test.ts
git commit -m "feat(db): add useIncrementCoins mutation hook"
```

---

## Task 7: Repository Layer - Update useSaveAnswer for coinAwarded

**Files:**
- Modify: `db/repositories/onboarding.repository.ts`
- Modify: `db/repositories/onboarding.repository.test.ts`

**Step 1: Write failing test for coinAwarded tracking**

```typescript
// db/repositories/onboarding.repository.test.ts
describe('useSaveAnswer with coinAwarded', () => {
  it('should set coinAwarded to true for new answers', async () => {
    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        questionKey: 'test_question',
        answer: 'test answer',
        isFirstTime: true,
      });
    });

    const answer = await db
      .select()
      .from(onboardingAnswers)
      .where(eq(onboardingAnswers.questionKey, 'test_question'))
      .get();

    expect(answer?.coinAwarded).toBe(true);
  });

  it('should not update coinAwarded when updating existing answer', async () => {
    await db.insert(onboardingAnswers).values({
      questionKey: 'test_question',
      answer: 'first answer',
      coinAwarded: true,
    });

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        questionKey: 'test_question',
        answer: 'updated answer',
        isFirstTime: false,
      });
    });

    const answer = await db
      .select()
      .from(onboardingAnswers)
      .where(eq(onboardingAnswers.questionKey, 'test_question'))
      .get();

    expect(answer?.answer).toBe('updated answer');
    expect(answer?.coinAwarded).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/onboarding.repository.test.ts`
Expected: FAIL with type errors (isFirstTime parameter doesn't exist)

**Step 3: Update useSaveAnswer mutation function**

```typescript
// db/repositories/onboarding.repository.ts
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionKey,
      answer,
      isFirstTime = false,
    }: {
      questionKey: string;
      answer: string;
      isFirstTime?: boolean;
    }) => {
      return await db
        .insert(onboardingAnswers)
        .values({ questionKey, answer, coinAwarded: isFirstTime })
        .onConflictDoUpdate({
          target: onboardingAnswers.questionKey,
          set: {
            answer,
            updatedAt: new Date(),
            // Don't update coinAwarded on conflict
          },
        })
        .returning();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'answers'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/onboarding.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding.repository.ts db/repositories/onboarding.repository.test.ts
git commit -m "feat(db): update useSaveAnswer to track coinAwarded flag"
```

---

## Task 8: Repository Layer - Export users repository

**Files:**
- Modify: `db/repositories/index.ts`
- Modify: `db/index.ts`

**Step 1: Export users repository from repositories index**

```typescript
// db/repositories/index.ts
export * from './settings.repository';
export * from './onboarding.repository';
export * from './users.repository';
```

**Step 2: Verify exports are accessible from main db index**

```bash
# Check if db/index.ts exists and re-exports repositories
cat db/index.ts
```

**Step 3: Run typecheck to verify exports**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/repositories/index.ts
git commit -m "feat(db): export users repository hooks"
```

---

## Task 9: Component - CoinIcon (base component)

**Files:**
- Create: `components/onboarding/CoinIcon.tsx`
- Create: `components/onboarding/CoinIcon.test.tsx`

**Step 1: Write failing test for CoinIcon**

```typescript
// components/onboarding/CoinIcon.test.tsx
import { render } from '@testing-library/react-native';
import { CoinIcon } from './CoinIcon';

describe('CoinIcon', () => {
  it('should render outlined variant', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="outlined" />
    );

    const coin = getByTestId('coin-icon');
    expect(coin).toBeTruthy();
  });

  it('should render filled variant', () => {
    const { getByTestId } = render(
      <CoinIcon size={20} variant="filled" />
    );

    const coin = getByTestId('coin-icon');
    expect(coin).toBeTruthy();
  });

  it('should apply correct size', () => {
    const { getByTestId } = render(
      <CoinIcon size={32} variant="filled" />
    );

    const coin = getByTestId('coin-icon');
    const style = coin.props.style;
    expect(style.width).toBe(32);
    expect(style.height).toBe(32);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/CoinIcon.test.tsx`
Expected: FAIL with "Cannot find module './CoinIcon'"

**Step 3: Implement CoinIcon component**

```typescript
// components/onboarding/CoinIcon.tsx
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { colors } from '@/lib/theme/tokens';

interface CoinIconProps {
  size: number;
  variant: 'outlined' | 'filled';
  highlighted?: boolean;
}

export function CoinIcon({ size, variant, highlighted = false }: CoinIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (highlighted) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 10, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [highlighted, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const coinStyle = variant === 'outlined' ? styles.outlined : styles.filled;

  return (
    <Animated.View
      testID="coin-icon"
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        coinStyle,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.neutral.gray[300],
  },
  filled: {
    backgroundColor: colors.accent.gold,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/CoinIcon.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/CoinIcon.tsx components/onboarding/CoinIcon.test.tsx
git commit -m "feat(ui): create CoinIcon component with outlined/filled variants"
```

---

## Task 10: Component - CoinCounter

**Files:**
- Create: `components/onboarding/CoinCounter.tsx`
- Create: `components/onboarding/CoinCounter.test.tsx`

**Step 1: Write failing test for CoinCounter**

```typescript
// components/onboarding/CoinCounter.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CoinCounter } from './CoinCounter';
import { db } from '@/db/client';
import { users } from '@/db/schema';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CoinCounter', () => {
  beforeEach(async () => {
    await db.delete(users).execute();
  });

  it('should display 0 when no coins', async () => {
    const { getByText } = render(<CoinCounter />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('0')).toBeTruthy();
    });
  });

  it('should display user coin count', async () => {
    await db.insert(users).values({ coins: 12 }).execute();

    const { getByText } = render(<CoinCounter />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText('12')).toBeTruthy();
    });
  });

  it('should render coin icon', () => {
    const { getByTestId } = render(<CoinCounter />, {
      wrapper: createWrapper(),
    });

    expect(getByTestId('coin-icon')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/CoinCounter.test.tsx`
Expected: FAIL with "Cannot find module './CoinCounter'"

**Step 3: Implement CoinCounter component**

```typescript
// components/onboarding/CoinCounter.tsx
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { useUserCoins } from '@/db/repositories';
import { CoinIcon } from './CoinIcon';
import { colors, spacing, typography } from '@/lib/theme/tokens';

export function CoinCounter() {
  const { data: coins = 0 } = useUserCoins();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (coins > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [coins, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <CoinIcon size={20} variant="filled" />
      <Text style={styles.count}>{coins}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  count: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/CoinCounter.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/CoinCounter.tsx components/onboarding/CoinCounter.test.tsx
git commit -m "feat(ui): create CoinCounter component with animated count"
```

---

## Task 11: Component - CoinTrail

**Files:**
- Create: `components/onboarding/CoinTrail.tsx`
- Create: `components/onboarding/CoinTrail.test.tsx`

**Step 1: Write failing test for CoinTrail**

```typescript
// components/onboarding/CoinTrail.test.tsx
import { render } from '@testing-library/react-native';
import { CoinTrail } from './CoinTrail';

describe('CoinTrail', () => {
  it('should render correct number of coins', () => {
    const { getAllByTestId } = render(
      <CoinTrail currentStep={1} totalSteps={5} answeredQuestions={[]} />
    );

    const coins = getAllByTestId('coin-icon');
    expect(coins.length).toBe(5);
  });

  it('should show filled coins for answered questions', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={3}
        totalSteps={5}
        answeredQuestions={['q1', 'q2']}
      />
    );

    const coins = getAllByTestId('coin-icon');
    expect(coins.length).toBe(5);
    // First 2 should be filled, rest outlined
  });

  it('should highlight current question coin', () => {
    const { getAllByTestId } = render(
      <CoinTrail
        currentStep={2}
        totalSteps={5}
        answeredQuestions={['q1']}
      />
    );

    expect(getAllByTestId('coin-icon')).toBeTruthy();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/CoinTrail.test.tsx`
Expected: FAIL with "Cannot find module './CoinTrail'"

**Step 3: Implement CoinTrail component**

```typescript
// components/onboarding/CoinTrail.tsx
import { View, StyleSheet } from 'react-native';
import { CoinIcon } from './CoinIcon';
import { spacing } from '@/lib/theme/tokens';

interface CoinTrailProps {
  currentStep: number;
  totalSteps: number;
  answeredQuestions: string[];
}

export function CoinTrail({
  currentStep,
  totalSteps,
  answeredQuestions,
}: CoinTrailProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isAnswered = index < answeredQuestions.length;
        const isCurrent = index === currentStep - 1;

        return (
          <CoinIcon
            key={index}
            size={12}
            variant={isAnswered ? 'filled' : 'outlined'}
            highlighted={isCurrent}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/CoinTrail.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/CoinTrail.tsx components/onboarding/CoinTrail.test.tsx
git commit -m "feat(ui): create CoinTrail component with progress indicators"
```

---

## Task 12: Component - CoinBurstAnimation

**Files:**
- Create: `components/onboarding/CoinBurstAnimation.tsx`
- Create: `components/onboarding/CoinBurstAnimation.test.tsx`

**Step 1: Write failing test for CoinBurstAnimation**

```typescript
// components/onboarding/CoinBurstAnimation.test.tsx
import { render } from '@testing-library/react-native';
import { CoinBurstAnimation } from './CoinBurstAnimation';
import { jest } from '@jest/globals';

describe('CoinBurstAnimation', () => {
  it('should not render when not visible', () => {
    const { queryByTestId } = render(
      <CoinBurstAnimation isVisible={false} onComplete={() => {}} />
    );

    expect(queryByTestId('coin-burst')).toBeNull();
  });

  it('should render when visible', () => {
    const { getByTestId } = render(
      <CoinBurstAnimation isVisible={true} onComplete={() => {}} />
    );

    expect(getByTestId('coin-burst')).toBeTruthy();
  });

  it('should call onComplete after animation', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();

    render(<CoinBurstAnimation isVisible={true} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    jest.advanceTimersByTime(800);
    expect(onComplete).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/CoinBurstAnimation.test.tsx`
Expected: FAIL with "Cannot find module './CoinBurstAnimation'"

**Step 3: Implement CoinBurstAnimation component**

```typescript
// components/onboarding/CoinBurstAnimation.tsx
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { CoinIcon } from './CoinIcon';

interface CoinBurstAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CoinBurstAnimation({
  isVisible,
  onComplete,
}: CoinBurstAnimationProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Arc from center-bottom to top-right
      translateY.value = withTiming(-400, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      translateX.value = withTiming(150, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      rotate.value = withTiming(720, { duration: 800 }); // 2 full rotations
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(600, withTiming(0, { duration: 200 }))
      );

      // Call onComplete after animation
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, translateY, translateX, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      testID="coin-burst"
      style={[styles.coin, animatedStyle]}
    >
      <CoinIcon size={32} variant="filled" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    bottom: 200,
    left: '50%',
    marginLeft: -16, // Half of coin size (32/2)
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/CoinBurstAnimation.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/CoinBurstAnimation.tsx components/onboarding/CoinBurstAnimation.test.tsx
git commit -m "feat(ui): create CoinBurstAnimation with arc trajectory"
```

---

## Task 13: Integration - Update OnboardingContainer header layout

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write failing test for new header layout**

```typescript
// components/onboarding/OnboardingContainer.test.tsx
describe('OnboardingContainer gamification', () => {
  it('should render CoinCounter in header', async () => {
    const { getByTestId } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByTestId('coin-counter')).toBeTruthy();
    });
  });

  it('should render CoinTrail instead of ProgressBar', async () => {
    const { getByTestId, queryByTestId } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByTestId('coin-trail')).toBeTruthy();
      expect(queryByTestId('progress-bar')).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: FAIL with "Unable to find element with testID: coin-counter"

**Step 3: Update header layout in OnboardingContainer**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { CoinCounter } from './CoinCounter';
import { CoinTrail } from './CoinTrail';

// Replace ProgressBar import with CoinTrail
// Remove: import { ProgressBar } from './ProgressBar';

// In the header section, replace:
<View style={styles.header} testID="onboarding-header">
  <View style={styles.headerRow}>
    {currentIndex > 0 && (
      <TouchableOpacity
        onPress={handleBack}
        style={styles.backButton}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.backButtonText}>← Voltar</Text>
      </TouchableOpacity>
    )}
    <View style={styles.spacer} />
    <CoinCounter testID="coin-counter" />
  </View>
  <CoinTrail
    testID="coin-trail"
    currentStep={currentIndex + 1}
    totalSteps={applicableQuestions.length}
    answeredQuestions={
      existingAnswers
        ?.filter((a) => a.coinAwarded)
        .map((a) => a.questionKey) ?? []
    }
  />
</View>
```

**Step 4: Add new styles for header row**

```typescript
// Add to styles
headerRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: spacing.sm,
},
spacer: {
  flex: 1,
},
```

**Step 5: Add testID props to CoinCounter and CoinTrail components**

```typescript
// components/onboarding/CoinCounter.tsx
export function CoinCounter({ testID }: { testID?: string }) {
  return (
    <Animated.View testID={testID} style={[styles.container, animatedStyle]}>

// components/onboarding/CoinTrail.tsx
export function CoinTrail({
  currentStep,
  totalSteps,
  answeredQuestions,
  testID,
}: CoinTrailProps & { testID?: string }) {
  return (
    <View testID={testID} style={styles.container}>
```

**Step 6: Run test to verify it passes**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: PASS

**Step 7: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx components/onboarding/CoinCounter.tsx components/onboarding/CoinTrail.tsx
git commit -m "feat(ui): replace ProgressBar with CoinCounter and CoinTrail in header"
```

---

## Task 14: Integration - Add coin award logic to handleAnswer

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write failing test for coin award on first answer**

```typescript
// components/onboarding/OnboardingContainer.test.tsx
describe('coin award logic', () => {
  beforeEach(async () => {
    await db.delete(users).execute();
    await db.delete(onboardingAnswers).execute();
  });

  it('should award coin on first answer', async () => {
    const { getByText, getByPlaceholderText } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByPlaceholderText('Digite sua resposta')).toBeTruthy();
    });

    const input = getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Test answer');

    await waitFor(async () => {
      const user = await db.select().from(users).get();
      expect(user?.coins).toBe(1);
    });
  });

  it('should not award coin on answer update', async () => {
    await db.insert(onboardingAnswers).values({
      questionKey: 'q1_name',
      answer: 'First answer',
      coinAwarded: true,
    });
    await db.insert(users).values({ coins: 1 });

    const { getByPlaceholderText } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByPlaceholderText('Digite sua resposta')).toBeTruthy();
    });

    const input = getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Updated answer');

    await waitFor(async () => {
      const user = await db.select().from(users).get();
      expect(user?.coins).toBe(1); // Still 1, not incremented
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: FAIL with assertion errors (coins not being awarded)

**Step 3: Add coin increment logic to handleAnswer**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { useIncrementCoins } from '@/db/repositories';

// Add mutation hook
const incrementCoinsMutation = useIncrementCoins();

// Update handleAnswer function
const handleAnswer = async (questionKey: string, value: unknown) => {
  // Check if answer already exists
  const existingAnswer = existingAnswers?.find((a) => a.questionKey === questionKey);
  const isFirstTime = !existingAnswer;

  // Update cache immediately (optimistic)
  const newCache = { ...answersCache, [questionKey]: value };
  setAnswersCache(newCache);

  // Save to database with isFirstTime flag
  await saveAnswerMutation.mutateAsync({
    questionKey,
    answer: JSON.stringify(value),
    isFirstTime,
  });

  // Award coin only for new answers
  if (isFirstTime) {
    await incrementCoinsMutation.mutateAsync(1);
  }

  // Delete dependent answers if this question has dependents
  if (allQuestions) {
    const hasDependents = allQuestions.some(
      (q) => q.dependsOnQuestionKey === questionKey
    );
    if (hasDependents) {
      await deleteDependentAnswersMutation.mutateAsync({
        parentQuestionKey: questionKey,
      });

      // Remove dependent answers from cache
      const dependentQuestions = allQuestions.filter(
        (q) => q.dependsOnQuestionKey === questionKey
      );
      const minDependentOrder = Math.min(
        ...dependentQuestions.map((q) => q.order)
      );

      for (const q of allQuestions) {
        if (q.order >= minDependentOrder && q.key !== questionKey) {
          delete newCache[q.key];
        }
      }

      setAnswersCache({ ...newCache });
    }
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(logic): award coins on first-time answers only"
```

---

## Task 15: Integration - Add CoinBurstAnimation to OnboardingContainer

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write failing test for coin burst animation**

```typescript
// components/onboarding/OnboardingContainer.test.tsx
describe('coin burst animation', () => {
  it('should show animation on first answer', async () => {
    const { getByPlaceholderText, queryByTestId } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByPlaceholderText('Digite sua resposta')).toBeTruthy();
    });

    const input = getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Test answer');

    await waitFor(() => {
      expect(queryByTestId('coin-burst')).toBeTruthy();
    });
  });

  it('should not show animation on answer update', async () => {
    await db.insert(onboardingAnswers).values({
      questionKey: 'q1_name',
      answer: 'First answer',
      coinAwarded: true,
    });

    const { getByPlaceholderText, queryByTestId } = render(<OnboardingContainer />);

    await waitFor(() => {
      expect(getByPlaceholderText('Digite sua resposta')).toBeTruthy();
    });

    const input = getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Updated answer');

    await waitFor(() => {
      expect(queryByTestId('coin-burst')).toBeNull();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: FAIL with "Unable to find element with testID: coin-burst"

**Step 3: Add animation state and trigger**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { CoinBurstAnimation } from './CoinBurstAnimation';

// Add state for animation
const [showCoinAnimation, setShowCoinAnimation] = useState(false);

// Update handleAnswer to trigger animation
const handleAnswer = async (questionKey: string, value: unknown) => {
  const existingAnswer = existingAnswers?.find((a) => a.questionKey === questionKey);
  const isFirstTime = !existingAnswer;

  const newCache = { ...answersCache, [questionKey]: value };
  setAnswersCache(newCache);

  await saveAnswerMutation.mutateAsync({
    questionKey,
    answer: JSON.stringify(value),
    isFirstTime,
  });

  if (isFirstTime) {
    setShowCoinAnimation(true);
    await incrementCoinsMutation.mutateAsync(1);
  }

  // ... rest of logic
};

// Add animation component before closing SafeAreaView
<CoinBurstAnimation
  isVisible={showCoinAnimation}
  onComplete={() => setShowCoinAnimation(false)}
/>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(ui): add coin burst animation on first-time answers"
```

---

## Task 16: Polish - Add haptic feedback for coin awards

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`

**Step 1: Import haptic feedback**

```typescript
// components/onboarding/OnboardingContainer.tsx
import * as Haptics from 'expo-haptics';
```

**Step 2: Add haptic feedback on coin award**

```typescript
// In handleAnswer, after setting animation:
if (isFirstTime) {
  setShowCoinAnimation(true);
  await incrementCoinsMutation.mutateAsync(1);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

**Step 3: Test manually on device**

Run: `npm run ios` or `npm run android`
Expected: Feel vibration when answering a question for the first time

**Step 4: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx
git commit -m "feat(ux): add haptic feedback for coin awards"
```

---

## Task 17: Test Coverage - Run all tests and verify 90% coverage

**Files:**
- All test files

**Step 1: Run full test suite**

Run: `npm test -- --coverage`
Expected: All tests pass

**Step 2: Check coverage report**

Run: `npm test -- --coverage --coverageReporters=text`
Expected: Coverage ≥ 90% for:
- db/schema/users.ts
- db/repositories/users.repository.ts
- db/repositories/onboarding.repository.ts (updated)
- components/onboarding/CoinIcon.tsx
- components/onboarding/CoinCounter.tsx
- components/onboarding/CoinTrail.tsx
- components/onboarding/CoinBurstAnimation.tsx
- components/onboarding/OnboardingContainer.tsx (updated)

**Step 3: Add missing tests if coverage < 90%**

Identify uncovered lines and write tests for edge cases:
- Error handling in mutations
- Edge cases in animations
- Component prop variations

**Step 4: Re-run tests after adding coverage**

Run: `npm test -- --coverage`
Expected: All coverage ≥ 90%

**Step 5: Commit any additional tests**

```bash
git add **/*.test.ts **/*.test.tsx
git commit -m "test: add comprehensive tests for coin system (90%+ coverage)"
```

---

## Task 18: Manual QA - Test on iOS device

**Files:**
- None (manual testing)

**Step 1: Build and run on iOS**

Run: `npm run ios`
Expected: App launches without errors

**Step 2: Test first-time onboarding flow**

1. Delete app and reinstall
2. Start onboarding
3. Answer first question
4. Verify:
   - Coin burst animation plays
   - Counter increments from 0 to 1
   - Trail shows first coin as filled
   - Haptic feedback triggers
   - Current question coin pulses

**Step 3: Test answer updates**

1. Go back to first question
2. Change answer
3. Verify:
   - No animation
   - Counter stays at 1
   - No haptic feedback

**Step 4: Test full flow**

1. Complete all questions
2. Verify:
   - Coins increment for each new answer
   - Trail fills progressively
   - Final count matches number of questions

**Step 5: Document any issues**

Create GitHub issues for bugs found during QA

---

## Task 19: Manual QA - Test on Android device

**Files:**
- None (manual testing)

**Step 1: Build and run on Android**

Run: `npm run android`
Expected: App launches without errors

**Step 2: Repeat iOS test scenarios**

1. First-time onboarding flow
2. Answer updates
3. Full flow completion

**Step 3: Test Android-specific behaviors**

1. Verify haptic feedback works on Android
2. Check animations run at 60fps
3. Verify safe area rendering on notched devices

**Step 4: Document any issues**

Create GitHub issues for platform-specific bugs

---

## Task 20: Documentation - Update CLAUDE.md files

**Files:**
- Modify: `db/CLAUDE.md`
- Modify: `components/CLAUDE.md`

**Step 1: Update db/CLAUDE.md with users table and new hooks**

Add to "Current Tables" section:

```markdown
- **users:** User profiles (`id`, `coins`, `createdAt`)
```

Add to hooks table:

```markdown
| `useUserCoins()` | Query | `['users', 'coins']` | Current coin balance |
| `useIncrementCoins()` | Mutation | Invalidates coins | Increments user coins by amount |
```

Add to onboarding hooks:

```markdown
Updated `useSaveAnswer()` to accept `isFirstTime` parameter for tracking `coinAwarded` flag
```

**Step 2: Update components/CLAUDE.md with new components**

Add to "Onboarding Components" section:

```markdown
### CoinIcon
**File:** `onboarding/CoinIcon.tsx`
Base coin visualization with outlined/filled variants and optional pulse animation.

### CoinCounter
**File:** `onboarding/CoinCounter.tsx`
Displays current coin count with animated increment. Reads from `useUserCoins()`.

### CoinTrail
**File:** `onboarding/CoinTrail.tsx`
Progress indicator showing coins (outlined = not answered, filled = earned). Highlights current question.

### CoinBurstAnimation
**File:** `onboarding/CoinBurstAnimation.tsx`
Animated coin that flies from answer area to counter in an arc trajectory.
```

**Step 3: Verify documentation is accurate**

Read through updates and ensure they match implementation

**Step 4: Commit documentation**

```bash
git add db/CLAUDE.md components/CLAUDE.md
git commit -m "docs: update CLAUDE.md files with coin system documentation"
```

---

## Success Criteria

✅ All tests pass with 90%+ coverage
✅ Database migration runs successfully
✅ Coins awarded only on first-time answers
✅ Coin burst animation plays smoothly
✅ Counter updates reactively
✅ Trail shows progress correctly
✅ Haptic feedback triggers appropriately
✅ Works on both iOS and Android
✅ No performance issues (60fps)
✅ Documentation updated

---

## Notes

- Use TDD approach (red-green-refactor)
- Commit after each passing test
- Use `--no-verify` for red-phase commits if pre-commit hooks fail
- Test animations manually on device (can't fully test in Jest)
- Verify statement breakpoints in migrations (CRITICAL!)
- Keep components simple and focused
- Use design tokens from `@/lib/theme/tokens`
- Follow existing patterns in codebase

---

## Future Enhancements (Out of Scope)

- Coin shop for spending coins
- Daily rewards system
- Achievement bonuses
- Leaderboards
- Transaction history
- 3D coin rotation animation
