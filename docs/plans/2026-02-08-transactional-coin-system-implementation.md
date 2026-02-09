# Transactional Coin System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace direct coin balance system with transactional ledger to prevent duplicate coin awards when users reset onboarding.

**Architecture:** Create `coin_transactions` table as single source of truth, derive balance from SUM of transactions, check transaction history (not answers table) to prevent duplicates, migrate existing coin data with full backfill and cleanup.

**Tech Stack:** Expo 54, React Native 0.81.5, Drizzle ORM, expo-sqlite, TanStack Query v5, TypeScript

---

## Task 1: Database Schema - Create coin-transactions schema

**Files:**
- Create: `db/schema/coin-transactions.ts`
- Create: `db/schema/coin-transactions.test.ts`
- Modify: `db/schema/index.ts`

**Step 1: Write failing test for coin-transactions schema**

```typescript
// db/schema/coin-transactions.test.ts
import { describe, it, expect } from '@jest/globals';
import { coinTransactions, TransactionType } from './coin-transactions';

describe('coinTransactions schema', () => {
  it('should have required fields', () => {
    const schema = coinTransactions;
    expect(schema.id).toBeDefined();
    expect(schema.amount).toBeDefined();
    expect(schema.type).toBeDefined();
    expect(schema.metadata).toBeDefined();
    expect(schema.createdAt).toBeDefined();
  });

  it('should infer correct types', () => {
    type CoinTransaction = typeof coinTransactions.$inferSelect;
    type NewCoinTransaction = typeof coinTransactions.$inferInsert;

    const transaction: CoinTransaction = {
      id: 1,
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: '{"questionKey":"q1"}',
      createdAt: new Date(),
    };

    expect(transaction).toBeDefined();
  });

  it('should have TransactionType enum', () => {
    expect(TransactionType.ONBOARDING_ANSWER).toBe('onboarding_answer');
    expect(TransactionType.DAILY_REWARD).toBe('daily_reward');
    expect(TransactionType.PURCHASE).toBe('purchase');
    expect(TransactionType.BONUS).toBe('bonus');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/schema/coin-transactions.test.ts`
Expected: FAIL with "Cannot find module './coin-transactions'"

**Step 3: Create coin-transactions schema**

```typescript
// db/schema/coin-transactions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const getDefaultTransactionCreatedAt = () => new Date();

export const coinTransactions = sqliteTable('coin_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(),
  type: text('type').notNull(),
  metadata: text('metadata'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultTransactionCreatedAt),
});

export type CoinTransaction = typeof coinTransactions.$inferSelect;
export type NewCoinTransaction = typeof coinTransactions.$inferInsert;

export enum TransactionType {
  ONBOARDING_ANSWER = 'onboarding_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}
```

**Step 4: Export from schema index**

```typescript
// db/schema/index.ts
// Add this line to existing exports:
export * from './coin-transactions';
```

**Step 5: Run test to verify it passes**

Run: `npm test -- db/schema/coin-transactions.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add db/schema/coin-transactions.ts db/schema/coin-transactions.test.ts db/schema/index.ts
git commit -m "feat(db): add coin_transactions schema with TransactionType enum"
```

---

## Task 2: Generate and Convert Migration 0004 - Create coin_transactions table

**Files:**
- Generate: `db/migrations/0004_*.sql` (auto-generated, will be deleted)
- Create: `db/migrations/0004_add_coin_transactions.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Generate migration from schema changes**

Run: `npm run db:generate`
Expected: Creates new `.sql` file in `db/migrations/`

**Step 2: Find the generated migration file**

Run: `ls -la db/migrations/*.sql | tail -1`
Expected: Shows path to newest `.sql` file (e.g., `0004_*.sql`)

**Step 3: Read the SQL content**

Run: `cat db/migrations/0004_*.sql`
Expected: Shows SQL statements with `--> statement-breakpoint` markers

**Step 4: Convert .sql to .ts (preserve statement breakpoints!)**

```typescript
// db/migrations/0004_add_coin_transactions.ts
export default `CREATE TABLE \`coin_transactions\` (
	\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	\`amount\` integer NOT NULL,
	\`type\` text NOT NULL,
	\`metadata\` text,
	\`created_at\` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX \`tx_type_idx\` ON \`coin_transactions\` (\`type\`);
--> statement-breakpoint
CREATE INDEX \`tx_created_idx\` ON \`coin_transactions\` (\`created_at\`);`;
```

**CRITICAL:** Preserve `--> statement-breakpoint` markers exactly as they appear!

**Step 5: Update migrations registry**

```typescript
// db/migrations/migrations.ts
import journal from './meta/_journal.json';
import m0000 from './0000_true_gideon';
import m0001 from './0001_add_onboarding_tables';
import m0002 from './0002_add_coins';
import m0003 from './0003_backfill_coins';
import m0004 from './0004_add_coin_transactions';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
  }
};
```

**Step 6: Delete the .sql file**

Run: `rm db/migrations/0004_*.sql`
Expected: .sql file removed

**Step 7: Verify migration loads without errors**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 8: Commit**

```bash
git add db/migrations/0004_add_coin_transactions.ts db/migrations/migrations.ts db/migrations/meta/
git commit -m "feat(db): add migration for coin_transactions table with indexes"
```

---

## Task 3: Create Migration 0005 - Backfill existing coin data

**Files:**
- Create: `db/migrations/0005_backfill_transactions.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Create backfill migration**

```typescript
// db/migrations/0005_backfill_transactions.ts
export default `
INSERT INTO coin_transactions (amount, type, metadata, created_at)
SELECT
  1 as amount,
  'onboarding_answer' as type,
  json_object('questionKey', question_key) as metadata,
  answered_at as created_at
FROM onboarding_answers
WHERE coin_awarded = 1;
`.trim();
```

**Step 2: Update migrations registry**

```typescript
// db/migrations/migrations.ts
import m0005 from './0005_backfill_transactions';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
  }
};
```

**Step 3: Verify migration syntax**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/migrations/0005_backfill_transactions.ts db/migrations/migrations.ts
git commit -m "feat(db): backfill coin transactions from existing onboarding answers"
```

---

## Task 4: Create Migration 0006 - Cleanup old coin fields

**Files:**
- Create: `db/migrations/0006_cleanup_old_coin_fields.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Create cleanup migration**

```typescript
// db/migrations/0006_cleanup_old_coin_fields.ts
export default `
ALTER TABLE onboarding_answers DROP COLUMN coin_awarded;
--> statement-breakpoint
ALTER TABLE users DROP COLUMN coins;
`.trim();
```

**Step 2: Update migrations registry**

```typescript
// db/migrations/migrations.ts
import m0006 from './0006_cleanup_old_coin_fields';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
    m0002,
    m0003,
    m0004,
    m0005,
    m0006,
  }
};
```

**Step 3: Verify migration syntax**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/migrations/0006_cleanup_old_coin_fields.ts db/migrations/migrations.ts
git commit -m "feat(db): remove deprecated coin_awarded and coins fields"
```

---

## Task 5: Repository Layer - useUserCoins (derived from transactions)

**Files:**
- Create: `db/repositories/coin-transactions.repository.ts`
- Create: `db/repositories/coin-transactions.repository.test.ts`

**Step 1: Write failing test for useUserCoins**

```typescript
// db/repositories/coin-transactions.repository.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserCoins } from './coin-transactions.repository';
import { db } from '../client';
import { coinTransactions } from '../schema';

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
    await db.delete(coinTransactions).execute();
  });

  it('should return 0 when no transactions exist', async () => {
    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(0);
  });

  it('should return correct sum with single transaction', async () => {
    await db.insert(coinTransactions).values({
      amount: 5,
      type: 'onboarding_answer',
      metadata: '{"questionKey":"q1"}',
    });

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(5);
  });

  it('should return correct sum with multiple transactions', async () => {
    await db.insert(coinTransactions).values([
      { amount: 1, type: 'onboarding_answer', metadata: '{"questionKey":"q1"}' },
      { amount: 2, type: 'onboarding_answer', metadata: '{"questionKey":"q2"}' },
      { amount: 3, type: 'bonus', metadata: null },
    ]);

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(6);
  });

  it('should handle negative amounts correctly', async () => {
    await db.insert(coinTransactions).values([
      { amount: 10, type: 'onboarding_answer', metadata: '{"questionKey":"q1"}' },
      { amount: -3, type: 'purchase', metadata: '{"itemId":"item1"}' },
    ]);

    const { result } = renderHook(() => useUserCoins(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(7);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: FAIL with "Cannot find module './coin-transactions.repository'"

**Step 3: Implement useUserCoins hook**

```typescript
// db/repositories/coin-transactions.repository.ts
import { useQuery } from '@tanstack/react-query';
import { sql } from 'drizzle-orm';
import { db } from '../client';
import { coinTransactions } from '../schema';

export function useUserCoins() {
  return useQuery({
    queryKey: ['users', 'coins'],
    queryFn: async () => {
      const result = await db
        .select({
          total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`
        })
        .from(coinTransactions)
        .get();
      return result?.total ?? 0;
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts
git commit -m "feat(db): add useUserCoins hook with derived balance from transactions"
```

---

## Task 6: Repository Layer - useAwardCoins mutation

**Files:**
- Modify: `db/repositories/coin-transactions.repository.ts`
- Modify: `db/repositories/coin-transactions.repository.test.ts`

**Step 1: Write failing test for useAwardCoins**

```typescript
// db/repositories/coin-transactions.repository.test.ts
import { act } from '@testing-library/react-native';
import { useAwardCoins } from './coin-transactions.repository';

describe('useAwardCoins', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should create transaction and invalidate cache', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        award: useAwardCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));
    expect(result.current.coins.data).toBe(0);

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1' },
      });
    });

    await waitFor(() => expect(result.current.coins.data).toBe(1));
  });

  it('should store metadata as JSON string', async () => {
    const { result } = renderHook(() => useAwardCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1', extra: 'data' },
      });
    });

    const transaction = await db.select().from(coinTransactions).get();
    expect(transaction?.metadata).toBe('{"questionKey":"q1","extra":"data"}');
  });

  it('should handle null metadata', async () => {
    const { result } = renderHook(() => useAwardCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        amount: 5,
        type: 'bonus',
      });
    });

    const transaction = await db.select().from(coinTransactions).get();
    expect(transaction?.metadata).toBeNull();
  });

  it('should accumulate multiple awards', async () => {
    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        award: useAwardCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 1,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q1' },
      });
    });
    await waitFor(() => expect(result.current.coins.data).toBe(1));

    await act(async () => {
      await result.current.award.mutateAsync({
        amount: 2,
        type: 'onboarding_answer',
        metadata: { questionKey: 'q2' },
      });
    });
    await waitFor(() => expect(result.current.coins.data).toBe(3));
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: FAIL with test errors (useAwardCoins not defined)

**Step 3: Implement useAwardCoins mutation**

```typescript
// db/repositories/coin-transactions.repository.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useAwardCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      type,
      metadata,
    }: {
      amount: number;
      type: string;
      metadata?: Record<string, unknown>;
    }) => {
      const result = await db
        .insert(coinTransactions)
        .values({
          amount,
          type,
          metadata: metadata ? JSON.stringify(metadata) : null,
        })
        .returning();
      return result[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts
git commit -m "feat(db): add useAwardCoins mutation hook"
```

---

## Task 7: Repository Layer - useHasQuestionReward query

**Files:**
- Modify: `db/repositories/coin-transactions.repository.ts`
- Modify: `db/repositories/coin-transactions.repository.test.ts`

**Step 1: Write failing test for useHasQuestionReward**

```typescript
// db/repositories/coin-transactions.repository.test.ts
import { useHasQuestionReward } from './coin-transactions.repository';
import { TransactionType } from '../schema';

describe('useHasQuestionReward', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should return false when no transaction exists', async () => {
    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when transaction exists for question', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });

  it('should return false for different question key', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q2'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should ignore non-onboarding transactions', async () => {
    await db.insert(coinTransactions).values({
      amount: 5,
      type: TransactionType.BONUS,
      metadata: JSON.stringify({ questionKey: 'q1' }),
    });

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should handle multiple transactions for same question', async () => {
    // This shouldn't happen in practice, but test the edge case
    await db.insert(coinTransactions).values([
      {
        amount: 1,
        type: TransactionType.ONBOARDING_ANSWER,
        metadata: JSON.stringify({ questionKey: 'q1' }),
      },
      {
        amount: 1,
        type: TransactionType.ONBOARDING_ANSWER,
        metadata: JSON.stringify({ questionKey: 'q1' }),
      },
    ]);

    const { result } = renderHook(() => useHasQuestionReward('q1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: FAIL with test errors (useHasQuestionReward not defined)

**Step 3: Implement useHasQuestionReward query**

```typescript
// db/repositories/coin-transactions.repository.ts
import { eq, and } from 'drizzle-orm';
import { TransactionType } from '../schema';

export function useHasQuestionReward(questionKey: string) {
  return useQuery({
    queryKey: ['transactions', 'question', questionKey],
    queryFn: async () => {
      const transaction = await db
        .select()
        .from(coinTransactions)
        .where(
          and(
            eq(coinTransactions.type, TransactionType.ONBOARDING_ANSWER),
            sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
          )
        )
        .get();
      return !!transaction;
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts
git commit -m "feat(db): add useHasQuestionReward query hook"
```

---

## Task 8: Repository Layer - useResetUserCoins mutation

**Files:**
- Modify: `db/repositories/coin-transactions.repository.ts`
- Modify: `db/repositories/coin-transactions.repository.test.ts`

**Step 1: Write failing test for useResetUserCoins**

```typescript
// db/repositories/coin-transactions.repository.test.ts
import { useResetUserCoins } from './coin-transactions.repository';

describe('useResetUserCoins', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should delete all transactions and reset balance to 0', async () => {
    // Create some transactions
    await db.insert(coinTransactions).values([
      { amount: 1, type: 'onboarding_answer', metadata: '{"questionKey":"q1"}' },
      { amount: 2, type: 'onboarding_answer', metadata: '{"questionKey":"q2"}' },
      { amount: 3, type: 'bonus', metadata: null },
    ]);

    const { result } = renderHook(
      () => ({
        coins: useUserCoins(),
        reset: useResetUserCoins(),
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.coins.isSuccess).toBe(true));
    expect(result.current.coins.data).toBe(6);

    await act(async () => {
      await result.current.reset.mutateAsync();
    });

    await waitFor(() => expect(result.current.coins.data).toBe(0));

    // Verify transactions were deleted
    const transactions = await db.select().from(coinTransactions).all();
    expect(transactions.length).toBe(0);
  });

  it('should handle empty transaction table', async () => {
    const { result } = renderHook(() => useResetUserCoins(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    const transactions = await db.select().from(coinTransactions).all();
    expect(transactions.length).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: FAIL with test errors (useResetUserCoins not defined)

**Step 3: Implement useResetUserCoins mutation**

```typescript
// db/repositories/coin-transactions.repository.ts
export function useResetUserCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db.delete(coinTransactions).execute();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- db/repositories/coin-transactions.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts
git commit -m "feat(db): add useResetUserCoins mutation hook"
```

---

## Task 9: Repository Layer - Export coin-transactions repository

**Files:**
- Modify: `db/repositories/index.ts`
- Modify: `db/index.ts`

**Step 1: Export coin-transactions repository from repositories index**

```typescript
// db/repositories/index.ts
export * from './settings.repository';
export * from './onboarding.repository';
export * from './users.repository';
export * from './coin-transactions.repository';
```

**Step 2: Verify exports are accessible from main db index**

Run: `cat db/index.ts`
Expected: Should have `export * from './repositories';`

**Step 3: Run typecheck to verify exports**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/repositories/index.ts
git commit -m "feat(db): export coin-transactions repository hooks"
```

---

## Task 10: Update OnboardingContainer - Replace coin logic

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write failing test for new transaction-based coin logic**

```typescript
// components/onboarding/OnboardingContainer.test.tsx
import { coinTransactions, TransactionType } from '@/db/schema';

describe('transaction-based coin awards', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
    await db.delete(onboardingAnswers).execute();
  });

  it('should create transaction on first answer', async () => {
    const { getByTestId } = render(<OnboardingContainer />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('onboarding-container')).toBeTruthy();
    });

    // Simulate answering first question
    // (Exact implementation depends on your test utilities)

    await waitFor(async () => {
      const transactions = await db.select().from(coinTransactions).all();
      expect(transactions.length).toBe(1);
      expect(transactions[0].type).toBe(TransactionType.ONBOARDING_ANSWER);
    });
  });

  it('should not create duplicate transaction for same question', async () => {
    // Pre-create a transaction for q1
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.ONBOARDING_ANSWER,
      metadata: JSON.stringify({ questionKey: 'q1_name' }),
    });

    const { getByTestId } = render(<OnboardingContainer />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByTestId('onboarding-container')).toBeTruthy();
    });

    // Simulate answering q1 again
    // (Should not create new transaction)

    await waitFor(async () => {
      const transactions = await db.select().from(coinTransactions).all();
      expect(transactions.length).toBe(1); // Still only 1
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: FAIL (still using old logic)

**Step 3: Update OnboardingContainer imports**

```typescript
// components/onboarding/OnboardingContainer.tsx
// Replace these imports:
// import { useIncrementCoins } from '@/db/repositories';

// With these:
import { useAwardCoins } from '@/db/repositories';
import { TransactionType } from '@/db/schema';
```

**Step 4: Replace incrementCoinsMutation with awardCoinsMutation**

```typescript
// components/onboarding/OnboardingContainer.tsx
// Replace:
// const incrementCoinsMutation = useIncrementCoins();

// With:
const awardCoinsMutation = useAwardCoins();
```

**Step 5: Add helper to check if question has reward**

```typescript
// components/onboarding/OnboardingContainer.tsx
// Add this function inside the component:
const checkQuestionReward = async (questionKey: string): Promise<boolean> => {
  const transaction = await db
    .select()
    .from(coinTransactions)
    .where(
      and(
        eq(coinTransactions.type, TransactionType.ONBOARDING_ANSWER),
        sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
      )
    )
    .get();
  return !!transaction;
};
```

**Step 6: Update handleAnswer to use transaction-based logic**

```typescript
// components/onboarding/OnboardingContainer.tsx
// Replace the coin award section in handleAnswer:

// OLD:
// const existingAnswer = existingAnswers?.find(
//   (a) => a.questionKey === questionKey,
// );
// const isFirstTime = !existingAnswer;
//
// if (isFirstTime) {
//   await incrementCoinsMutation.mutateAsync(1);
//   setAnimatingCoinIndex(currentIndex);
//   Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
// }

// NEW:
const hasReward = await checkQuestionReward(questionKey);

if (!hasReward) {
  await awardCoinsMutation.mutateAsync({
    amount: 1,
    type: TransactionType.ONBOARDING_ANSWER,
    metadata: { questionKey },
  });
  setAnimatingCoinIndex(currentIndex);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

**Step 7: Add required imports at top of file**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { coinTransactions, TransactionType } from '@/db/schema';
import { db } from '@/db/client';
import { eq, and, sql } from 'drizzle-orm';
```

**Step 8: Run test to verify it passes**

Run: `npm test -- components/onboarding/OnboardingContainer.test.tsx`
Expected: PASS

**Step 9: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(onboarding): use transaction-based coin awards instead of answer tracking"
```

---

## Task 11: Update Reset Flow - Add transaction reset

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `app/(tabs)/index.test.tsx`

**Step 1: Write failing test for reset with transaction deletion**

```typescript
// app/(tabs)/index.test.tsx
import { coinTransactions } from '@/db/schema';

describe('reset onboarding with transactions', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
    await db.delete(onboardingAnswers).execute();
  });

  it('should delete all transactions on reset', async () => {
    // Create transactions
    await db.insert(coinTransactions).values([
      { amount: 1, type: 'onboarding_answer', metadata: '{"questionKey":"q1"}' },
      { amount: 1, type: 'onboarding_answer', metadata: '{"questionKey":"q2"}' },
    ]);

    const { getByTestId } = render(<HomeScreen />, {
      wrapper: createWrapper(),
    });

    const resetButton = getByTestId('reset-onboarding-button');

    await act(async () => {
      fireEvent.press(resetButton);
    });

    // Confirm the alert
    // (Alert confirmation depends on your test setup)

    await waitFor(async () => {
      const transactions = await db.select().from(coinTransactions).all();
      expect(transactions.length).toBe(0);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- app/(tabs)/index.test.tsx`
Expected: FAIL (transactions not being deleted)

**Step 3: Import useResetUserCoins**

```typescript
// app/(tabs)/index.tsx
import {
  useOnboardingStatus,
  useCompleteOnboarding,
  useResetOnboarding,
  useDeleteAllAnswers,
  useResetUserCoins,
} from '@/db';
```

**Step 4: Add resetCoinsMutation hook**

```typescript
// app/(tabs)/index.tsx
const resetCoinsMutation = useResetUserCoins();
```

**Step 5: Update handleResetOnboarding to delete transactions**

```typescript
// app/(tabs)/index.tsx
const handleResetOnboarding = () => {
  Alert.alert(
    'Refazer Onboarding',
    'Deseja refazer o onboarding? Todas as suas respostas e moedas serão apagadas.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Refazer',
        style: 'destructive',
        onPress: async () => {
          await deleteAllAnswersMutation.mutateAsync();
          await resetCoinsMutation.mutateAsync();
          await resetMutation.mutateAsync();
          router.replace('/onboarding');
        },
      },
    ],
  );
};
```

**Step 6: Update disabled state to include resetCoinsMutation**

```typescript
// app/(tabs)/index.tsx
disabled={
  resetMutation.isPending ||
  deleteAllAnswersMutation.isPending ||
  resetCoinsMutation.isPending
}
```

**Step 7: Update loading text**

```typescript
// app/(tabs)/index.tsx
{resetMutation.isPending ||
 deleteAllAnswersMutation.isPending ||
 resetCoinsMutation.isPending
  ? 'Resetando...'
  : 'Refazer Onboarding'}
```

**Step 8: Run test to verify it passes**

Run: `npm test -- app/(tabs)/index.test.tsx`
Expected: PASS

**Step 9: Commit**

```bash
git add app/(tabs)/index.tsx app/(tabs)/index.test.tsx
git commit -m "feat(reset): delete coin transactions on onboarding reset"
```

---

## Task 12: Deprecate old hooks - Update users.repository.ts

**Files:**
- Modify: `db/repositories/users.repository.ts`
- Modify: `db/repositories/users.repository.test.ts`

**Step 1: Add deprecation comments to useUserCoins**

```typescript
// db/repositories/users.repository.ts
/**
 * @deprecated Use useUserCoins from coin-transactions.repository.ts instead
 * This hook reads from the deprecated users.coins field
 */
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

**Step 2: Add deprecation comments to useIncrementCoins**

```typescript
// db/repositories/users.repository.ts
/**
 * @deprecated Use useAwardCoins from coin-transactions.repository.ts instead
 * This hook updates the deprecated users.coins field directly
 */
export function useIncrementCoins() {
  // ... existing implementation
}
```

**Step 3: Update test descriptions to note deprecation**

```typescript
// db/repositories/users.repository.test.ts
describe('users.repository (DEPRECATED)', () => {
  describe('useUserCoins (deprecated)', () => {
    // ... existing tests
  });

  describe('useIncrementCoins (deprecated)', () => {
    // ... existing tests
  });
});
```

**Step 4: Run tests to verify they still pass**

Run: `npm test -- db/repositories/users.repository.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/users.repository.ts db/repositories/users.repository.test.ts
git commit -m "docs(db): deprecate useUserCoins and useIncrementCoins in favor of transaction-based hooks"
```

---

## Task 13: Update schema files - Add deprecation comments

**Files:**
- Modify: `db/schema/users.ts`
- Modify: `db/schema/onboarding-answers.ts`

**Step 1: Add deprecation comment to users.coins field**

```typescript
// db/schema/users.ts
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // @deprecated - Use coin_transactions table instead. Will be removed in migration 0006.
  coins: integer('coins').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultUserCreatedAt),
});
```

**Step 2: Add deprecation comment to onboarding-answers.coinAwarded field**

```typescript
// db/schema/onboarding-answers.ts
export const onboardingAnswers = sqliteTable('onboarding_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull().unique(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  // @deprecated - Use coin_transactions table instead. Will be removed in migration 0006.
  coinAwarded: integer('coin_awarded', { mode: 'boolean' }).notNull().default(false),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnsweredAt),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnswerUpdatedAt),
});
```

**Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: No TypeScript errors

**Step 4: Commit**

```bash
git add db/schema/users.ts db/schema/onboarding-answers.ts
git commit -m "docs(db): add deprecation comments to coins and coinAwarded fields"
```

---

## Task 14: Test Coverage - Run full test suite

**Files:**
- All test files

**Step 1: Run full test suite with coverage**

Run: `npm test -- --coverage`
Expected: All tests pass

**Step 2: Check coverage report for new files**

Run: `npm test -- --coverage --coverageReporters=text | grep -A 5 "coin-transactions"`
Expected: Coverage ≥ 90% for:
- `db/schema/coin-transactions.ts`
- `db/repositories/coin-transactions.repository.ts`

**Step 3: If coverage is below 90%, identify gaps**

Run: `npm test -- --coverage --coverageReporters=html`
Then open: `coverage/lcov-report/index.html`
Expected: Identify uncovered lines

**Step 4: Add tests for any uncovered edge cases**

(Only if needed - should already be covered by existing tests)

**Step 5: Re-run tests after adding coverage**

Run: `npm test -- --coverage`
Expected: All coverage ≥ 90%

**Step 6: Commit any additional tests**

```bash
git add **/*.test.ts **/*.test.tsx
git commit -m "test: ensure 90%+ coverage for transactional coin system"
```

---

## Task 15: Documentation - Update db/CLAUDE.md

**Files:**
- Modify: `db/CLAUDE.md`

**Step 1: Add coin_transactions to Current Tables section**

```markdown
## Current Tables

- **settings:** Key-value store (`key`, `value`, `updatedAt`)
- **questions:** Onboarding questions (`id`, `key`, `order`, `type`, `category`, `questionText`, `required`, `dependsOnQuestionKey`, `dependsOnValue`, `metadata`, `createdAt`)
- **onboarding_answers:** User answers (`id`, `questionKey`, `userId`, `answer`, `coinAwarded` (deprecated), `answeredAt`, `updatedAt`)
- **users:** User profiles (`id`, `coins` (deprecated), `createdAt`)
- **coin_transactions:** Coin transaction ledger (`id`, `amount`, `type`, `metadata`, `createdAt`)
```

**Step 2: Add transaction types enum**

```markdown
### Transaction Types

```typescript
enum TransactionType {
  ONBOARDING_ANSWER = 'onboarding_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}
```
```

**Step 3: Update hooks table**

```markdown
### Coin Transaction Repository Hooks

| Hook | Type | Query Key | Description |
|------|------|-----------|-------------|
| `useUserCoins()` | Query | `['users', 'coins']` | Current coin balance (SUM of all transactions) |
| `useAwardCoins()` | Mutation | Invalidates coins | Creates transaction and awards coins |
| `useHasQuestionReward()` | Query | `['transactions', 'question', questionKey]` | Returns boolean - whether question has been rewarded |
| `useResetUserCoins()` | Mutation | Invalidates coins & transactions | Deletes all transactions (used on onboarding reset) |

### Deprecated Hooks

| Hook | Status | Replacement |
|------|--------|-------------|
| `useIncrementCoins()` (users.repository) | Deprecated | Use `useAwardCoins()` from coin-transactions.repository |
| `useUserCoins()` (users.repository) | Deprecated | Use `useUserCoins()` from coin-transactions.repository |
```

**Step 4: Add migration notes**

```markdown
### Migration 0006 Cleanup

Migration 0006 removes deprecated fields:
- `users.coins` - Use `coin_transactions` table instead
- `onboarding_answers.coinAwarded` - Use `coin_transactions` table instead

Balance is now derived: `SUM(coin_transactions.amount)`
```

**Step 5: Verify documentation accuracy**

Run: `cat db/CLAUDE.md | grep -A 3 "coin_transactions"`
Expected: Shows new table documentation

**Step 6: Commit documentation**

```bash
git add db/CLAUDE.md
git commit -m "docs: update db/CLAUDE.md with transactional coin system"
```

---

## Task 16: Documentation - Update components/CLAUDE.md

**Files:**
- Modify: `components/CLAUDE.md`

**Step 1: Update OnboardingContainer documentation**

```markdown
### OnboardingContainer

**File:** `onboarding/OnboardingContainer.tsx`

Main orchestrator wrapped in LinearGradient (#FFFFFF → #F8F9FB), SafeAreaView, and KeyboardAvoidingView. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/onboarding-flow`. Handles answer saving, navigation (Voltar/Próxima/Concluir), completion, and coin awards.

**Gamification:**
- Awards 1 coin per question via `useAwardCoins` (creates transaction record)
- Checks `coin_transactions` table (not `onboardingAnswers`) to prevent duplicate rewards
- Triggers 3D flip animation on CoinTrail coin via `animatingCoinIndex` state
- Triggers haptic feedback (success notification) on coin award
- **Transaction-based:** Coins persist across onboarding resets, only awarded once per question
- Idle button shake/pulse animation after 3 seconds if user hasn't progressed

**Hooks used:** `useOnboardingQuestions`, `useOnboardingAnswers`, `useSaveAnswer`, `useDeleteDependentAnswers`, `useCompleteOnboarding`, `useAwardCoins`
```

**Step 2: Verify documentation accuracy**

Run: `cat components/CLAUDE.md | grep -A 5 "useAwardCoins"`
Expected: Shows updated documentation

**Step 3: Commit documentation**

```bash
git add components/CLAUDE.md
git commit -m "docs: update components/CLAUDE.md with transaction-based coin logic"
```

---

## Task 17: Manual QA - Test migrations on fresh database

**Files:**
- None (manual testing)

**Step 1: Clear app data and reinstall**

iOS: Delete app from simulator, run `npm run ios`
Android: Uninstall app, run `npm run android`
Expected: App launches without errors

**Step 2: Verify migrations run successfully**

Check console for: "[DB] Migrations completed successfully"
Expected: All 7 migrations (0000-0006) execute

**Step 3: Verify coin_transactions table exists**

Add temporary debug log:
```typescript
const tables = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
console.log('Tables:', tables);
```
Expected: Shows `coin_transactions` in list

**Step 4: Test onboarding flow**

1. Complete onboarding
2. Answer all questions
3. Verify coin count increments
4. Check database for transactions

**Step 5: Test reset flow**

1. Reset onboarding
2. Verify coins = 0
3. Re-answer questions
4. Verify coins increment again

**Step 6: Remove debug logs**

Remove any temporary logging code added for testing

---

## Task 18: Manual QA - Test migration on existing database

**Files:**
- None (manual testing)

**Step 1: Prepare test device with existing data**

Use a device/simulator that already has:
- Answered onboarding questions
- `coinAwarded=true` on some answers
- `users.coins > 0`

**Step 2: Deploy updated app**

Run: `npm run ios` or `npm run android`
Expected: App launches, migrations run

**Step 3: Verify backfill worked**

Check that:
- Coin count matches previous count
- Transactions exist for previously answered questions
- Timestamps preserved from answered_at

**Step 4: Verify old fields removed**

Attempt to query old fields (should fail gracefully):
```typescript
// These should no longer exist after migration 0006
const user = await db.select({ coins: users.coins }).from(users).get();
```
Expected: TypeScript error (field doesn't exist)

**Step 5: Test normal operation**

Complete remaining onboarding questions, verify:
- New transactions created
- Balance updates correctly
- No duplicate coins awarded

---

## Task 19: Performance Testing - Verify query performance

**Files:**
- None (manual testing)

**Step 1: Add performance logging**

```typescript
// Temporary code for testing
console.time('useUserCoins query');
const { data: coins } = useUserCoins();
console.timeEnd('useUserCoins query');
```

**Step 2: Test with small dataset (10 transactions)**

Expected: Query completes in < 50ms

**Step 3: Test with medium dataset (100 transactions)**

Create 100 test transactions, measure query time
Expected: Query completes in < 100ms

**Step 4: Test with large dataset (1000 transactions)**

Create 1000 test transactions, measure query time
Expected: Query completes in < 200ms

**Step 5: Verify TanStack Query caching**

Measure first query vs subsequent queries
Expected: Cached queries return instantly

**Step 6: Remove performance logging**

Remove all temporary performance measurement code

---

## Task 20: Final Integration Test - Full flow test

**Files:**
- Create: `e2e/transactional-coins.test.ts` (if E2E framework exists)

**Step 1: Test complete onboarding with coin awards**

1. Start fresh onboarding
2. Answer all questions
3. Verify each answer creates transaction
4. Verify final balance = question count
5. Complete onboarding

**Step 2: Test onboarding reset**

1. Reset onboarding
2. Verify balance = 0
3. Verify all transactions deleted
4. Start onboarding again

**Step 3: Test re-answering after reset**

1. Answer same questions
2. Verify new transactions created
3. Verify balance increments again
4. Complete onboarding

**Step 4: Document test results**

Create test report: `docs/testing/transactional-coins-test-report.md`
Include:
- Test scenarios executed
- Pass/fail status
- Any issues found
- Screenshots/videos if applicable

**Step 5: Commit test report**

```bash
git add docs/testing/transactional-coins-test-report.md
git commit -m "test: add transactional coin system integration test report"
```

---

## Success Criteria

✅ All tests pass with 90%+ coverage
✅ Migrations run successfully on fresh database
✅ Migrations run successfully on existing database with backfill
✅ Coins awarded only once per question
✅ Coins persist across onboarding resets
✅ Balance derived from transaction SUM
✅ Reset flow deletes all transactions
✅ No performance degradation (queries < 200ms)
✅ Documentation updated
✅ Works on both iOS and Android

---

## Notes

- Use TDD approach (red-green-refactor) for all tasks
- Commit after each passing test (frequent commits)
- Use `--no-verify` for red-phase commits if needed
- Test migrations manually on both fresh and existing databases
- Verify statement breakpoints in all migrations (CRITICAL!)
- Follow existing patterns in codebase
- Use design tokens from `@/lib/theme/tokens`
- DRY: Don't duplicate transaction checking logic
- YAGNI: No transaction history UI yet (out of scope)

---

## Rollback Plan

If issues are found in production:

1. **Immediate:** Revert to previous commit before migrations
2. **Database:** Users may have duplicate transactions if partially migrated
3. **Fix:** Add idempotency checks to backfill migration
4. **Re-deploy:** After fixes, re-run migrations

---

## Future Enhancements (Out of Scope)

- Transaction history UI
- Transaction filtering/search
- Export transaction history
- Negative transactions for spending coins
- Multi-user support
- Performance optimization (materialized view)
- Transaction soft-delete (for audit)
