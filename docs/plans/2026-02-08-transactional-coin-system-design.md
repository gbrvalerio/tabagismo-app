# Transactional Coin System - Design Document

**Date:** 2026-02-08
**Status:** Approved
**Problem:** Users can earn duplicate coins when resetting onboarding because the system only checks the `onboarding_answers` table (which gets deleted on reset) instead of having a permanent transaction history.

---

## Solution Overview

Replace the direct coin balance system with a transactional ledger approach where all coin activity is recorded as transactions. The user's balance is derived from the sum of all transactions, providing an immutable audit trail that persists across onboarding resets.

---

## Design Decisions

### 1. Single User App
- No `userId` field needed - app is single-user mode
- Simplifies queries and schema

### 2. Coin Balance Calculation
- **Derived from transactions** (not cached in users table)
- Balance = `SUM(transactions.amount)`
- Single source of truth
- Trades query performance for guaranteed accuracy

### 3. Reset Behavior
- When user resets onboarding: **delete all transactions** and reset balance to 0
- User can re-earn coins for same questions after reset
- Clean slate experience

---

## Database Schema

### New Table: `coin_transactions`

```typescript
// db/schema/coin-transactions.ts
export const coinTransactions = sqliteTable('coin_transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: integer('amount').notNull(), // Can be positive or negative
  type: text('type').notNull(), // 'onboarding_answer', 'daily_reward', etc.
  metadata: text('metadata'), // JSON string: {"questionKey": "q1_name"}
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
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

### Indexes

```sql
CREATE INDEX tx_type_idx ON coin_transactions (type);
CREATE INDEX tx_created_idx ON coin_transactions (created_at);
```

### Changes to Existing Tables

**Remove fields (after migration):**
- `users.coins` - No longer needed, balance derived from transactions
- `onboarding_answers.coinAwarded` - No longer needed, check transactions instead

---

## Repository Layer

### New Hooks

#### `useUserCoins()` - Get current balance

```typescript
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

#### `useAwardCoins()` - Create transaction

```typescript
export function useAwardCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      amount,
      type,
      metadata
    }: {
      amount: number;
      type: string;
      metadata?: Record<string, unknown>
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

#### `useHasQuestionReward()` - Check if question already awarded

```typescript
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

#### `useResetUserCoins()` - Reset balance (for onboarding reset)

```typescript
export function useResetUserCoins() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db.delete(coinTransactions).execute();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'coins'] });
    },
  });
}
```

### Deprecated Hooks

- `useIncrementCoins()` - Replace with `useAwardCoins()`

---

## Migration Strategy

### Migration 1: Create coin_transactions table

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

### Migration 2: Backfill existing data

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

This preserves existing coin history by converting answered questions with `coinAwarded=true` into transaction records.

### Migration 3: Clean up old fields

```typescript
// db/migrations/0006_cleanup_old_coin_fields.ts
export default `
ALTER TABLE onboarding_answers DROP COLUMN coin_awarded;
--> statement-breakpoint
ALTER TABLE users DROP COLUMN coins;
`.trim();
```

---

## Component Changes

### OnboardingContainer.tsx

**Current logic:**
```typescript
const existingAnswer = existingAnswers?.find((a) => a.questionKey === questionKey);
const isFirstTime = !existingAnswer;

if (isFirstTime) {
  await incrementCoinsMutation.mutateAsync(1);
  setAnimatingCoinIndex(currentIndex);
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
```

**New logic:**
```typescript
// Check transaction table instead of answers table
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

**Key difference:** Check transactions (permanent) instead of answers (deleted on reset).

### app/(tabs)/index.tsx - Reset Flow

**Update reset handler:**
```typescript
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
          await resetCoinsMutation.mutateAsync(); // NEW: Reset transactions
          await resetMutation.mutateAsync();
          router.replace('/onboarding');
        },
      },
    ],
  );
};
```

---

## Testing Strategy

### Schema Tests
- `db/schema/coin-transactions.test.ts`
  - Verify table structure and field types
  - Test type inference for CoinTransaction
  - Test metadata JSON serialization

### Repository Tests
- `db/repositories/coin-transactions.repository.test.ts`
  - `useUserCoins()` returns 0 when no transactions
  - `useUserCoins()` returns correct SUM with multiple transactions
  - `useUserCoins()` handles negative amounts correctly
  - `useAwardCoins()` creates transaction and invalidates cache
  - `useHasQuestionReward()` returns false when no transaction
  - `useHasQuestionReward()` returns true when transaction exists
  - `useHasQuestionReward()` filters by questionKey correctly
  - `useResetUserCoins()` deletes all transactions

### Integration Tests
- `components/onboarding/OnboardingContainer.test.tsx`
  - First answer creates transaction
  - Second answer to same question doesn't duplicate
  - Coin animation triggers only on new transaction
  - Reset deletes transactions, balance becomes 0
  - After reset, answering creates new transaction

### Migration Tests
- `db/migrate.test.ts`
  - Backfill creates transactions from existing answers
  - Backfill preserves timestamps
  - Backfill only migrates coinAwarded=true answers
  - Cleanup removes old columns

---

## Benefits

✅ **Prevents duplicate coin awards** - Transactions persist across resets
✅ **Single source of truth** - Balance always derived from transactions
✅ **Audit trail** - Complete history of all coin activity
✅ **Extensible** - Easy to add new transaction types (purchases, rewards, etc.)
✅ **Simple reset** - Just delete transactions, balance auto-resets

---

## Trade-offs

⚠️ **More queries** - SUM query on every render (mitigated by TanStack Query caching)
⚠️ **Migration complexity** - Need to backfill existing data
⚠️ **Breaking change** - Requires updating multiple components

---

## Future Enhancements (Out of Scope)

- Transaction history UI
- Negative transactions for spending coins
- Transaction filtering/search
- Export transaction history
- Multi-user support (add userId field)
- Performance optimization (materialized view for balance)

---

## Implementation Notes

- Use TDD approach (red-green-refactor)
- Follow existing patterns in codebase
- Preserve statement breakpoints in migrations
- Test migrations on clean database
- Manual QA on both iOS and Android
- Update CLAUDE.md files after completion
