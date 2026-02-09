# Question Flow Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor onboarding-specific question system into a generic, reusable flow for multiple contexts (onboarding, daily check-ins, mood tracking).

**Architecture:** Context-based separation using `context` field in schema, caller-defined rewards via props, generic repository layer with context parameter, single `question_answers` table replacing `onboarding_answers`.

**Tech Stack:** React Native, Expo Router, Drizzle ORM, TanStack Query, SQLite

---

## Critical Review & Improvements

### ✅ What's Good in the Design

1. **Context-based architecture** - Simple, flexible, no schema changes for new flows
2. **Caller-defined rewards** - Keeps business logic out of data model
3. **Transaction-based coin tracking** - Already implemented, prevents duplicates
4. **Breaking changes acceptable** - No MVP yet, clean slate
5. **Comprehensive migration strategy** - Preserves existing data

### ⚠️ Proposed Improvements

1. **Unique constraint issue**: The plan specifies `(context, questionKey, userId)` unique constraint, but `userId` is nullable. SQLite treats NULL as unique, allowing multiple NULL values. This could cause issues.
   - **Fix**: Either make `userId` NOT NULL with a default (e.g., 1), or change to `(context, questionKey)` if single-user assumption holds.

2. **Missing context constraint on questions table**: The plan adds a `context` field to questions but doesn't add a unique constraint for `(context, key)`.
   - **Fix**: Add unique index/constraint to prevent duplicate keys within same context.

3. **Component folder rename timing**: Moving `components/onboarding/*` to `components/question-flow/*` mid-implementation could break tests.
   - **Fix**: Rename components LAST, after all logic is refactored and tests are updated.

4. **Repository hook context parameter**: Current hooks are context-specific (e.g., `useOnboardingQuestions()`). The plan proposes generic hooks with context param (e.g., `useQuestions('onboarding')`).
   - **Question**: Should we keep convenience wrappers for onboarding? `export const useOnboardingQuestions = () => useQuestions('onboarding')`?
   - **Decision**: No wrappers. Explicit context is clear enough and reduces maintenance burden.

5. **CoinTrail backwards compatibility**: CoinTrail currently uses `answeredQuestions={existingAnswers?.filter(a => a.coinAwarded).map(a => a.questionKey) ?? []}`. After refactor, `coinAwarded` field is gone.
   - **Fix**: Change to query `coin_transactions` table for answered questions in context.

6. **Transaction type change**: `ONBOARDING_ANSWER` → `QUESTION_ANSWER` breaks existing transaction queries.
   - **Fix**: Migration must UPDATE existing transactions to use new type, OR keep reading both types.

7. **Missing step**: Update seed data to include `context: 'onboarding'` in questions.
   - **Fix**: Add task to update seed file.

---

## Implementation Tasks

### Phase 1: Database Schema & Migration

#### Task 1: Update Questions Schema

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/schema/questions.ts`

**Step 1: Write failing test for context field**

```typescript
// db/schema/questions.test.ts
import { db } from '../client';
import { questions } from './questions';

describe('questions schema - context field', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
  });

  it('should insert question with context', async () => {
    const result = await db.insert(questions).values({
      context: 'onboarding',
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'What is your name?',
      required: true,
    });
    expect(result).toBeDefined();
  });

  it('should allow same key in different contexts', async () => {
    await db.insert(questions).values({
      context: 'onboarding',
      key: 'mood',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'How are you feeling?',
    });

    await db.insert(questions).values({
      context: 'daily_checkin',
      key: 'mood',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'What is your mood today?',
    });

    const allQuestions = await db.select().from(questions).all();
    expect(allQuestions).toHaveLength(2);
  });

  it('should enforce unique (context, key) constraint', async () => {
    await db.insert(questions).values({
      context: 'onboarding',
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'What is your name?',
    });

    await expect(
      db.insert(questions).values({
        context: 'onboarding',
        key: 'name',
        order: 2,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Duplicate key',
      })
    ).rejects.toThrow();
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/schema/questions.test.ts
```

Expected: FAIL - "column context does not exist"

**Step 3: Update schema to add context field**

```typescript
// db/schema/questions.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const getDefaultCreatedAt = () => new Date();

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull().default('onboarding'),
  key: text('key').notNull(),
  order: integer('order').notNull(),
  type: text('type').notNull(),
  category: text('category').notNull(),
  questionText: text('question_text').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  dependsOnQuestionKey: text('depends_on_question_key'),
  dependsOnValue: text('depends_on_value'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultCreatedAt),
}, (table) => ({
  contextKeyIdx: index('questions_context_key_unique').on(table.context, table.key).unique(),
}));

export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;

export enum QuestionType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
}

export enum QuestionCategory {
  PROFILE = 'PROFILE',
  ADDICTION = 'ADDICTION',
  HABITS = 'HABITS',
  MOTIVATION = 'MOTIVATION',
  GOALS = 'GOALS',
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- db/schema/questions.test.ts
```

Expected: PASS (after migration is generated and applied)

**Step 5: Commit**

```bash
git add db/schema/questions.ts db/schema/questions.test.ts
git commit -m "feat(schema): add context field to questions table with unique constraint"
```

---

#### Task 2: Create Question Answers Schema

**Files:**
- Create: `/Volumes/development/Tabagismo/db/schema/question-answers.ts`
- Create: `/Volumes/development/Tabagismo/db/schema/question-answers.test.ts`

**Step 1: Write failing test for question_answers table**

```typescript
// db/schema/question-answers.test.ts
import { db } from '../client';
import { questionAnswers } from './question-answers';

describe('question_answers schema', () => {
  beforeEach(async () => {
    await db.delete(questionAnswers).execute();
  });

  it('should insert answer with context', async () => {
    const result = await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'name',
      userId: 1,
      answer: '"John"',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });
    expect(result).toBeDefined();
  });

  it('should enforce unique constraint on (context, questionKey, userId)', async () => {
    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'name',
      userId: 1,
      answer: '"John"',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      db.insert(questionAnswers).values({
        context: 'onboarding',
        questionKey: 'name',
        userId: 1,
        answer: '"Jane"',
        answeredAt: new Date(),
        updatedAt: new Date(),
      })
    ).rejects.toThrow();
  });

  it('should allow same questionKey in different contexts', async () => {
    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'mood',
      userId: 1,
      answer: '"happy"',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(questionAnswers).values({
      context: 'daily_checkin',
      questionKey: 'mood',
      userId: 1,
      answer: '"sad"',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });

    const answers = await db.select().from(questionAnswers).all();
    expect(answers).toHaveLength(2);
  });

  it('should allow NULL userId with unique constraint', async () => {
    // SQLite treats NULL as unique, so multiple NULLs are allowed
    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'name',
      userId: null,
      answer: '"John"',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'age',
      userId: null,
      answer: '25',
      answeredAt: new Date(),
      updatedAt: new Date(),
    });

    const answers = await db.select().from(questionAnswers).all();
    expect(answers).toHaveLength(2);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/schema/question-answers.test.ts
```

Expected: FAIL - "no such table: question_answers"

**Step 3: Create question-answers schema**

```typescript
// db/schema/question-answers.ts
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const getDefaultAnsweredAt = () => new Date();
export const getDefaultAnswerUpdatedAt = () => new Date();

export const questionAnswers = sqliteTable('question_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull(),
  questionKey: text('question_key').notNull(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnsweredAt),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(getDefaultAnswerUpdatedAt),
}, (table) => ({
  contextKeyUserIdx: index('question_answers_context_key_user_unique').on(table.context, table.questionKey, table.userId).unique(),
}));

export type QuestionAnswer = typeof questionAnswers.$inferSelect;
export type NewQuestionAnswer = typeof questionAnswers.$inferInsert;
```

**Step 4: Export from schema index**

```typescript
// db/schema/index.ts
export * from './settings';
export * from './questions';
export * from './question-answers'; // NEW
export * from './onboarding-answers';
export * from './users';
export * from './coin-transactions';
```

**Step 5: Run test to verify it passes (after migration)**

```bash
npm test -- db/schema/question-answers.test.ts
```

Expected: PASS (after migration is applied)

**Step 6: Commit**

```bash
git add db/schema/question-answers.ts db/schema/question-answers.test.ts db/schema/index.ts
git commit -m "feat(schema): create question_answers table with context support"
```

---

#### Task 3: Update Transaction Type Enum

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/schema/coin-transactions.ts`
- Modify: `/Volumes/development/Tabagismo/db/schema/coin-transactions.test.ts`

**Step 1: Write test for new transaction type**

```typescript
// db/schema/coin-transactions.test.ts
import { db } from '../client';
import { coinTransactions, TransactionType } from './coin-transactions';

describe('coin_transactions schema - QUESTION_ANSWER type', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  it('should insert transaction with QUESTION_ANSWER type', async () => {
    const result = await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'onboarding',
        questionKey: 'name',
      }),
    });
    expect(result).toBeDefined();
  });

  it('should query QUESTION_ANSWER transactions by context', async () => {
    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'onboarding',
        questionKey: 'name',
      }),
    });

    await db.insert(coinTransactions).values({
      amount: 1,
      type: TransactionType.QUESTION_ANSWER,
      metadata: JSON.stringify({
        context: 'daily_checkin',
        questionKey: 'mood',
      }),
    });

    const onboardingTransactions = await db
      .select()
      .from(coinTransactions)
      .where(sql`json_extract(${coinTransactions.metadata}, '$.context') = 'onboarding'`)
      .all();

    expect(onboardingTransactions).toHaveLength(1);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/schema/coin-transactions.test.ts
```

Expected: FAIL - "TransactionType.QUESTION_ANSWER does not exist"

**Step 3: Add QUESTION_ANSWER to TransactionType enum**

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
  ONBOARDING_ANSWER = 'onboarding_answer', // @deprecated - Use QUESTION_ANSWER instead
  QUESTION_ANSWER = 'question_answer',
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- db/schema/coin-transactions.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add db/schema/coin-transactions.ts db/schema/coin-transactions.test.ts
git commit -m "feat(schema): add QUESTION_ANSWER transaction type"
```

---

#### Task 4: Generate Migration

**Step 1: Generate migration from schema changes**

```bash
npm run db:generate
```

Expected: Creates new `.sql` file in `db/migrations/`

**Step 2: Identify migration file**

```bash
ls -lt db/migrations/*.sql | head -n 1
```

Expected: Shows path to newest `.sql` file (e.g., `0007_genericize_questions.sql`)

**Step 3: Review migration SQL**

Read the generated migration to understand what Drizzle created.

Expected: Sees `ALTER TABLE questions ADD COLUMN context...`, `CREATE TABLE question_answers...`, etc.

---

#### Task 5: Write Data Migration SQL

**Files:**
- Create migration file manually (will be identified in next step)

**Step 1: Create manual migration SQL with data preservation**

**CRITICAL**: This migration must:
1. Add `context` column to `questions` (default 'onboarding')
2. Create `question_answers` table
3. Migrate data from `onboarding_answers` to `question_answers` with context
4. Update existing `ONBOARDING_ANSWER` transactions to `QUESTION_ANSWER` with context metadata
5. Drop `onboarding_answers` table
6. Add unique constraints

```sql
-- Migration: 0007_genericize_questions.sql

-- 1. Add context column to questions (defaults to 'onboarding' for existing rows)
ALTER TABLE questions ADD COLUMN context TEXT NOT NULL DEFAULT 'onboarding';
--> statement-breakpoint

-- 2. Create unique index on (context, key)
CREATE UNIQUE INDEX questions_context_key_unique ON questions (context, key);
--> statement-breakpoint

-- 3. Create new question_answers table
CREATE TABLE question_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  context TEXT NOT NULL,
  question_key TEXT NOT NULL,
  user_id INTEGER,
  answer TEXT NOT NULL,
  answered_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint

-- 4. Create unique index on (context, question_key, user_id)
CREATE UNIQUE INDEX question_answers_context_key_user_unique ON question_answers (context, question_key, user_id);
--> statement-breakpoint

-- 5. Migrate data from onboarding_answers to question_answers
INSERT INTO question_answers (context, question_key, user_id, answer, answered_at, updated_at)
SELECT 'onboarding', question_key, user_id, answer, answered_at, updated_at
FROM onboarding_answers;
--> statement-breakpoint

-- 6. Update existing ONBOARDING_ANSWER transactions to QUESTION_ANSWER with context metadata
UPDATE coin_transactions
SET
  type = 'question_answer',
  metadata = json_object(
    'context', 'onboarding',
    'questionKey', json_extract(metadata, '$.questionKey')
  )
WHERE type = 'onboarding_answer';
--> statement-breakpoint

-- 7. Drop old onboarding_answers table
DROP TABLE onboarding_answers;
```

**Step 2: Convert SQL to TypeScript module**

```typescript
// db/migrations/0007_genericize_questions.ts
export default `-- Migration: 0007_genericize_questions.sql

-- 1. Add context column to questions (defaults to 'onboarding' for existing rows)
ALTER TABLE questions ADD COLUMN context TEXT NOT NULL DEFAULT 'onboarding';
--> statement-breakpoint

-- 2. Create unique index on (context, key)
CREATE UNIQUE INDEX questions_context_key_unique ON questions (context, key);
--> statement-breakpoint

-- 3. Create new question_answers table
CREATE TABLE question_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  context TEXT NOT NULL,
  question_key TEXT NOT NULL,
  user_id INTEGER,
  answer TEXT NOT NULL,
  answered_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
--> statement-breakpoint

-- 4. Create unique index on (context, question_key, user_id)
CREATE UNIQUE INDEX question_answers_context_key_user_unique ON question_answers (context, question_key, user_id);
--> statement-breakpoint

-- 5. Migrate data from onboarding_answers to question_answers
INSERT INTO question_answers (context, question_key, user_id, answer, answered_at, updated_at)
SELECT 'onboarding', question_key, user_id, answer, answered_at, updated_at
FROM onboarding_answers;
--> statement-breakpoint

-- 6. Update existing ONBOARDING_ANSWER transactions to QUESTION_ANSWER with context metadata
UPDATE coin_transactions
SET
  type = 'question_answer',
  metadata = json_object(
    'context', 'onboarding',
    'questionKey', json_extract(metadata, '$.questionKey')
  )
WHERE type = 'onboarding_answer';
--> statement-breakpoint

-- 7. Drop old onboarding_answers table
DROP TABLE onboarding_answers;
`;
```

**Step 3: Register migration in migrations.ts**

```typescript
// db/migrations/migrations.ts
import journal from './meta/_journal.json';
import m0000 from './0000_initial_schema';
import m0001 from './0001_add_onboarding_tables';
import m0002 from './0002_add_users_table';
import m0003 from './0003_add_coin_transactions';
import m0004 from './0004_remove_coins_column';
import m0005 from './0005_add_metadata_to_transactions';
import m0006 from './0006_remove_coin_awarded';
import m0007 from './0007_genericize_questions'; // NEW

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
    m0007, // NEW
  },
};
```

**Step 4: Test migration manually**

```bash
# Clear app data to test fresh migration
# On iOS simulator: Device > Erase All Content and Settings
# Then run app
npm start
```

Expected: App starts, migration runs, no errors in console

**Step 5: Commit migration**

```bash
git add db/migrations/0007_genericize_questions.ts db/migrations/migrations.ts
git commit -m "feat(migration): add 0007_genericize_questions migration

- Adds context field to questions table
- Creates question_answers table
- Migrates data from onboarding_answers
- Updates ONBOARDING_ANSWER transactions to QUESTION_ANSWER
- Drops onboarding_answers table"
```

---

### Phase 2: Repository Layer

#### Task 6: Create Generic Questions Repository

**Files:**
- Create: `/Volumes/development/Tabagismo/db/repositories/questions.repository.ts`
- Create: `/Volumes/development/Tabagismo/db/repositories/questions.repository.test.ts`

**Step 1: Write failing tests for generic repository hooks**

```typescript
// db/repositories/questions.repository.test.ts
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../client';
import { questions, questionAnswers } from '../schema';
import {
  useQuestions,
  useAnswers,
  useSaveAnswer,
  useDeleteDependentAnswers,
  useDeleteAllAnswers,
} from './questions.repository';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('questions.repository', () => {
  beforeEach(async () => {
    await db.delete(questionAnswers).execute();
    await db.delete(questions).execute();
  });

  describe('useQuestions', () => {
    it('should fetch questions for specific context', async () => {
      await db.insert(questions).values([
        {
          context: 'onboarding',
          key: 'name',
          order: 1,
          type: 'TEXT',
          category: 'PROFILE',
          questionText: 'What is your name?',
        },
        {
          context: 'daily_checkin',
          key: 'mood',
          order: 1,
          type: 'TEXT',
          category: 'PROFILE',
          questionText: 'How are you feeling?',
        },
      ]);

      const { result } = renderHook(() => useQuestions('onboarding'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].context).toBe('onboarding');
      expect(result.current.data[0].key).toBe('name');
    });

    it('should return empty array if no questions in context', async () => {
      const { result } = renderHook(() => useQuestions('unknown_context'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual([]);
    });
  });

  describe('useAnswers', () => {
    it('should fetch answers for specific context', async () => {
      await db.insert(questionAnswers).values([
        {
          context: 'onboarding',
          questionKey: 'name',
          userId: 1,
          answer: '"John"',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
        {
          context: 'daily_checkin',
          questionKey: 'mood',
          userId: 1,
          answer: '"happy"',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const { result } = renderHook(() => useAnswers('onboarding'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toHaveLength(1);
      expect(result.current.data[0].context).toBe('onboarding');
      expect(result.current.data[0].questionKey).toBe('name');
    });
  });

  describe('useSaveAnswer', () => {
    it('should save answer with context', async () => {
      const { result } = renderHook(() => useSaveAnswer('onboarding'), {
        wrapper: createWrapper(),
      });

      await act(() =>
        result.current.mutate({
          questionKey: 'name',
          answer: '"John"',
        })
      );

      const saved = await db.select().from(questionAnswers).all();
      expect(saved).toHaveLength(1);
      expect(saved[0].context).toBe('onboarding');
      expect(saved[0].questionKey).toBe('name');
      expect(saved[0].answer).toBe('"John"');
    });

    it('should update existing answer on conflict', async () => {
      const { result } = renderHook(() => useSaveAnswer('onboarding'), {
        wrapper: createWrapper(),
      });

      await act(() =>
        result.current.mutate({ questionKey: 'name', answer: '"John"' })
      );

      await act(() =>
        result.current.mutate({ questionKey: 'name', answer: '"Jane"' })
      );

      const answers = await db.select().from(questionAnswers).all();
      expect(answers).toHaveLength(1);
      expect(answers[0].answer).toBe('"Jane"');
    });
  });

  describe('useDeleteDependentAnswers', () => {
    it('should delete answers for dependent questions in same context', async () => {
      await db.insert(questions).values([
        {
          context: 'onboarding',
          key: 'smoker',
          order: 1,
          type: 'SINGLE_CHOICE',
          category: 'ADDICTION',
          questionText: 'Do you smoke?',
        },
        {
          context: 'onboarding',
          key: 'years_smoking',
          order: 2,
          type: 'NUMBER',
          category: 'ADDICTION',
          questionText: 'How many years?',
          dependsOnQuestionKey: 'smoker',
          dependsOnValue: 'yes',
        },
      ]);

      await db.insert(questionAnswers).values([
        {
          context: 'onboarding',
          questionKey: 'smoker',
          userId: 1,
          answer: '"yes"',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
        {
          context: 'onboarding',
          questionKey: 'years_smoking',
          userId: 1,
          answer: '5',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const { result } = renderHook(() => useDeleteDependentAnswers('onboarding'), {
        wrapper: createWrapper(),
      });

      await act(() =>
        result.current.mutate({ parentQuestionKey: 'smoker' })
      );

      const remaining = await db.select().from(questionAnswers).all();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].questionKey).toBe('smoker');
    });
  });

  describe('useDeleteAllAnswers', () => {
    it('should delete all answers for specific context', async () => {
      await db.insert(questionAnswers).values([
        {
          context: 'onboarding',
          questionKey: 'name',
          userId: 1,
          answer: '"John"',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
        {
          context: 'daily_checkin',
          questionKey: 'mood',
          userId: 1,
          answer: '"happy"',
          answeredAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const { result } = renderHook(() => useDeleteAllAnswers('onboarding'), {
        wrapper: createWrapper(),
      });

      await act(() => result.current.mutate());

      const remaining = await db.select().from(questionAnswers).all();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].context).toBe('daily_checkin');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/repositories/questions.repository.test.ts
```

Expected: FAIL - "Cannot find module './questions.repository'"

**Step 3: Implement generic questions repository**

```typescript
// db/repositories/questions.repository.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { questions, questionAnswers } from '../schema';

export function useQuestions(context: string) {
  return useQuery({
    queryKey: ['questions', context],
    queryFn: async () => {
      return await db
        .select()
        .from(questions)
        .where(eq(questions.context, context))
        .orderBy(questions.order)
        .all();
    },
  });
}

export function useAnswers(context: string) {
  return useQuery({
    queryKey: ['answers', context],
    queryFn: async () => {
      return await db
        .select()
        .from(questionAnswers)
        .where(eq(questionAnswers.context, context))
        .all();
    },
  });
}

export function useSaveAnswer(context: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionKey,
      answer,
    }: {
      questionKey: string;
      answer: string;
    }) => {
      return await db
        .insert(questionAnswers)
        .values({
          context,
          questionKey,
          answer,
          answeredAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [questionAnswers.context, questionAnswers.questionKey, questionAnswers.userId],
          set: {
            answer,
            updatedAt: new Date(),
          },
        })
        .returning();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}

export function useDeleteDependentAnswers(context: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentQuestionKey }: { parentQuestionKey: string }) => {
      const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.context, context))
        .all();

      // Recursively find all descendant question keys
      const keysToDelete = new Set<string>();
      const findDescendants = (parentKey: string) => {
        for (const question of allQuestions) {
          if (question.dependsOnQuestionKey === parentKey && !keysToDelete.has(question.key)) {
            keysToDelete.add(question.key);
            findDescendants(question.key);
          }
        }
      };
      findDescendants(parentQuestionKey);

      // Delete answers for all descendant questions in this context
      for (const key of keysToDelete) {
        await db
          .delete(questionAnswers)
          .where(
            and(
              eq(questionAnswers.context, context),
              eq(questionAnswers.questionKey, key)
            )
          )
          .execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}

export function useDeleteAllAnswers(context: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .delete(questionAnswers)
        .where(eq(questionAnswers.context, context))
        .execute();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}
```

**Step 4: Export from repositories index**

```typescript
// db/repositories/index.ts
export * from './settings.repository';
export * from './questions.repository'; // NEW
export * from './onboarding.repository';
export * from './users.repository';
export * from './coin-transactions.repository';
```

**Step 5: Run test to verify it passes**

```bash
npm test -- db/repositories/questions.repository.test.ts
```

Expected: PASS

**Step 6: Commit**

```bash
git add db/repositories/questions.repository.ts db/repositories/questions.repository.test.ts db/repositories/index.ts
git commit -m "feat(repository): add generic questions repository with context support"
```

---

#### Task 7: Update Coin Transactions Repository

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.ts`
- Modify: `/Volumes/development/Tabagismo/db/repositories/coin-transactions.repository.test.ts`

**Step 1: Write test for context-aware hasQuestionReward**

```typescript
// db/repositories/coin-transactions.repository.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema';
import { useHasQuestionReward } from './coin-transactions.repository';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('coin-transactions.repository - context support', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
  });

  describe('useHasQuestionReward', () => {
    it('should check if question has been rewarded in specific context', async () => {
      await db.insert(coinTransactions).values({
        amount: 1,
        type: TransactionType.QUESTION_ANSWER,
        metadata: JSON.stringify({
          context: 'onboarding',
          questionKey: 'name',
        }),
      });

      const { result } = renderHook(
        () => useHasQuestionReward('onboarding', 'name'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(true);
    });

    it('should return false for question not rewarded in context', async () => {
      const { result } = renderHook(
        () => useHasQuestionReward('onboarding', 'age'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(false);
    });

    it('should distinguish between same question in different contexts', async () => {
      await db.insert(coinTransactions).values({
        amount: 1,
        type: TransactionType.QUESTION_ANSWER,
        metadata: JSON.stringify({
          context: 'onboarding',
          questionKey: 'mood',
        }),
      });

      const { result: onboardingResult } = renderHook(
        () => useHasQuestionReward('onboarding', 'mood'),
        { wrapper: createWrapper() }
      );

      const { result: checkinResult } = renderHook(
        () => useHasQuestionReward('daily_checkin', 'mood'),
        { wrapper: createWrapper() }
      );

      await waitFor(() => expect(onboardingResult.current.isSuccess).toBe(true));
      await waitFor(() => expect(checkinResult.current.isSuccess).toBe(true));

      expect(onboardingResult.current.data).toBe(true);
      expect(checkinResult.current.data).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/repositories/coin-transactions.repository.test.ts
```

Expected: FAIL - "useHasQuestionReward expects 2 arguments, got 1"

**Step 3: Update useHasQuestionReward to accept context**

```typescript
// db/repositories/coin-transactions.repository.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sql, eq, and } from 'drizzle-orm';
import { db } from '../client';
import { coinTransactions, TransactionType } from '../schema';

export function useUserCoinsFromTransactions() {
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

export function useUserCoins() {
  return useUserCoinsFromTransactions();
}

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

export function useHasQuestionReward(context: string, questionKey: string) {
  return useQuery({
    queryKey: ['transactions', 'question', context, questionKey],
    queryFn: async () => {
      const transaction = await db
        .select()
        .from(coinTransactions)
        .where(
          and(
            eq(coinTransactions.type, TransactionType.QUESTION_ANSWER),
            sql`json_extract(${coinTransactions.metadata}, '$.context') = ${context}`,
            sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
          )
        )
        .get();
      return !!transaction;
    },
  });
}

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

```bash
npm test -- db/repositories/coin-transactions.repository.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/coin-transactions.repository.ts db/repositories/coin-transactions.repository.test.ts
git commit -m "feat(repository): add context parameter to useHasQuestionReward"
```

---

### Phase 3: Utilities Layer

#### Task 8: Rename and Update Flow Utility

**Files:**
- Rename: `/Volumes/development/Tabagismo/lib/onboarding-flow.ts` → `/Volumes/development/Tabagismo/lib/question-flow.ts`
- Rename: `/Volumes/development/Tabagismo/lib/onboarding-flow.test.ts` → `/Volumes/development/Tabagismo/lib/question-flow.test.ts`
- Modify tests to use new filename

**Step 1: Run existing tests to ensure they pass**

```bash
npm test -- lib/onboarding-flow.test.ts
```

Expected: PASS

**Step 2: Rename files**

```bash
mv lib/onboarding-flow.ts lib/question-flow.ts
mv lib/onboarding-flow.test.ts lib/question-flow.test.ts
```

**Step 3: Update test imports**

```typescript
// lib/question-flow.test.ts
import { computeApplicableQuestions, calculateProgress } from './question-flow';
// ... rest of tests unchanged
```

**Step 4: Run tests to verify they still pass**

```bash
npm test -- lib/question-flow.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add lib/question-flow.ts lib/question-flow.test.ts
git rm lib/onboarding-flow.ts lib/onboarding-flow.test.ts
git commit -m "refactor(lib): rename onboarding-flow to question-flow"
```

---

### Phase 4: Update Seed Data

#### Task 9: Add Context to Seed Questions

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/seed/seed-questions.ts`
- Modify: `/Volumes/development/Tabagismo/db/seed/seed-questions.test.ts`

**Step 1: Write test for context in seed data**

```typescript
// db/seed/seed-questions.test.ts
import { db } from '../client';
import { questions } from '../schema';
import { seedOnboardingQuestions, onboardingQuestionsData } from './seed-questions';

describe('seed-questions - context field', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
  });

  it('should seed questions with onboarding context', async () => {
    await seedOnboardingQuestions();

    const seededQuestions = await db.select().from(questions).all();
    expect(seededQuestions.length).toBeGreaterThan(0);
    expect(seededQuestions.every(q => q.context === 'onboarding')).toBe(true);
  });

  it('onboardingQuestionsData should include context field', () => {
    expect(onboardingQuestionsData.every(q => q.context === 'onboarding')).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- db/seed/seed-questions.test.ts
```

Expected: FAIL - "Expected context to be 'onboarding', received undefined"

**Step 3: Update seed data to include context**

```typescript
// db/seed/seed-questions.ts
import { db } from '../client';
import { questions, QuestionType, QuestionCategory } from '../schema';

export const onboardingQuestionsData = [
  {
    context: 'onboarding',
    key: 'name',
    order: 1,
    type: QuestionType.TEXT,
    category: QuestionCategory.PROFILE,
    questionText: 'Qual é o seu nome?',
    required: true,
  },
  {
    context: 'onboarding',
    key: 'smoker',
    order: 2,
    type: QuestionType.SINGLE_CHOICE,
    category: QuestionCategory.ADDICTION,
    questionText: 'Você fuma?',
    required: true,
    metadata: {
      choices: ['Sim', 'Não'],
    },
  },
  // ... rest of questions with context: 'onboarding'
];

export async function seedOnboardingQuestions() {
  const existing = await db.select().from(questions).all();
  if (existing.length > 0) {
    console.log('[Seed] Questions already seeded, skipping');
    return;
  }

  await db.insert(questions).values(onboardingQuestionsData);
  console.log('[Seed] Seeded', onboardingQuestionsData.length, 'onboarding questions');
}
```

**Step 4: Run test to verify it passes**

```bash
npm test -- db/seed/seed-questions.test.ts
```

Expected: PASS

**Step 5: Commit**

```bash
git add db/seed/seed-questions.ts db/seed/seed-questions.test.ts
git commit -m "feat(seed): add context field to onboarding questions"
```

---

### Phase 5: Component Refactor

#### Task 10: Create QuestionFlowContainer Component

**Files:**
- Create: `/Volumes/development/Tabagismo/components/question-flow/QuestionFlowContainer.tsx`
- Create: `/Volumes/development/Tabagismo/components/question-flow/QuestionFlowContainer.test.tsx`

**Step 1: Write failing test for QuestionFlowContainer**

```typescript
// components/question-flow/QuestionFlowContainer.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '@/db/client';
import { questions, questionAnswers, coinTransactions } from '@/db/schema';
import { QuestionFlowContainer } from './QuestionFlowContainer';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('QuestionFlowContainer', () => {
  beforeEach(async () => {
    await db.delete(coinTransactions).execute();
    await db.delete(questionAnswers).execute();
    await db.delete(questions).execute();
  });

  it('should render questions for specified context', async () => {
    await db.insert(questions).values([
      {
        context: 'onboarding',
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Qual é o seu nome?',
      },
    ]);

    const { getByText } = render(
      <QuestionFlowContainer
        context="onboarding"
        onComplete={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getByText(/Qual é o seu nome?/)).toBeTruthy();
    });
  });

  it('should award coins when coinRewardPerQuestion > 0', async () => {
    await db.insert(questions).values([
      {
        context: 'onboarding',
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Qual é o seu nome?',
      },
    ]);

    const { getByTestId } = render(
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getByTestId('coin-counter')).toBeTruthy();
    });

    // Answer question
    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'John');

    // Check coin was awarded
    await waitFor(async () => {
      const transactions = await db.select().from(coinTransactions).all();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(1);
    });
  });

  it('should not render coin counter when coinRewardPerQuestion = 0', async () => {
    await db.insert(questions).values([
      {
        context: 'daily_checkin',
        key: 'mood',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Como você está?',
      },
    ]);

    const { queryByTestId } = render(
      <QuestionFlowContainer
        context="daily_checkin"
        coinRewardPerQuestion={0}
        onComplete={jest.fn()}
      />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(queryByTestId('coin-counter')).toBeNull();
    });
  });

  it('should call onComplete when all questions answered', async () => {
    await db.insert(questions).values([
      {
        context: 'onboarding',
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Qual é o seu nome?',
      },
    ]);

    const onComplete = jest.fn();

    const { getByText, getByTestId } = render(
      <QuestionFlowContainer
        context="onboarding"
        onComplete={onComplete}
      />,
      { wrapper: createWrapper() }
    );

    // Answer question
    await waitFor(() => {
      const input = getByTestId('text-input');
      fireEvent.changeText(input, 'John');
    });

    // Click finish
    const finishButton = getByText('✓ Concluir');
    fireEvent.press(finishButton);

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- components/question-flow/QuestionFlowContainer.test.tsx
```

Expected: FAIL - "Cannot find module './QuestionFlowContainer'"

**Step 3: Copy OnboardingContainer and refactor to QuestionFlowContainer**

```typescript
// components/question-flow/QuestionFlowContainer.tsx
import {
  useDeleteDependentAnswers,
  useAwardCoins,
  useAnswers,
  useQuestions,
  useSaveAnswer,
} from "@/db/repositories";
import { TransactionType, coinTransactions } from "@/db/schema";
import { computeApplicableQuestions } from "@/lib/question-flow";
import * as Haptics from "@/lib/haptics";
import { db } from "@/db/client";
import { eq, and, sql } from "drizzle-orm";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CoinCounter } from "./CoinCounter";
import { CoinTrail } from "./CoinTrail";
import { QuestionInput } from "./QuestionInput";
import { QuestionText } from "./QuestionText";

import { animations } from "@/lib/theme/animations";
import {
  colors,
  spacing,
  typography,
  typographyPresets,
} from "@/lib/theme/tokens";

export interface QuestionFlowProps {
  context: string;
  onComplete: () => void;
  coinRewardPerQuestion?: number;
}

export function QuestionFlowContainer({
  context,
  onComplete,
  coinRewardPerQuestion = 0,
}: QuestionFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});
  const [animatingCoinIndex, setAnimatingCoinIndex] = useState<number | null>(null);

  const { data: allQuestions, isLoading: questionsLoading } = useQuestions(context);
  const { data: existingAnswers, isLoading: answersLoading } = useAnswers(context);
  const saveAnswerMutation = useSaveAnswer(context);
  const deleteDependentAnswersMutation = useDeleteDependentAnswers(context);
  const awardCoinsMutation = useAwardCoins();

  const isLoading = questionsLoading || answersLoading;
  const initialLoadDone = useRef(false);

  const buttonShake = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    const cache = existingAnswers.reduce(
      (acc, answer) => {
        try {
          acc[answer.questionKey] = JSON.parse(answer.answer);
        } catch {
          acc[answer.questionKey] = answer.answer;
        }
        return acc;
      },
      {} as Record<string, unknown>,
    );

    setAnswersCache(cache);

    const applicable = computeApplicableQuestions(allQuestions, cache);
    const firstUnanswered = applicable.findIndex((q) => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  const applicableQuestions = allQuestions
    ? computeApplicableQuestions(allQuestions, answersCache)
    : [];

  const currentQuestion = applicableQuestions[currentIndex];
  const currentAnswer = currentQuestion ? answersCache[currentQuestion.key] : null;
  const isAnswered =
    currentAnswer !== undefined &&
    currentAnswer !== null &&
    currentAnswer !== "";
  const isLastQuestion = currentIndex === applicableQuestions.length - 1;

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: buttonShake.value },
      { scale: buttonScale.value },
    ],
  }));

  useEffect(() => {
    if (isLoading) return;

    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    buttonShake.value = 0;
    buttonScale.value = 1;

    if (isAnswered) {
      idleTimerRef.current = setTimeout(() => {
        buttonShake.value = withSequence(
          withTiming(6, { duration: 100, easing: Easing.inOut(Easing.ease) }),
          withTiming(-6, { duration: 100 }),
          withTiming(4, { duration: 100 }),
          withTiming(-4, { duration: 100 }),
          withTiming(0, { duration: 100 }),
        );

        buttonScale.value = withSequence(
          withSpring(1.05, { damping: 8, stiffness: 200 }),
          withSpring(1, animations.gentleSpring),
        );
      }, 3000);
    }

    return () => {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [isAnswered, currentIndex, isLoading]);

  const checkQuestionReward = async (questionKey: string): Promise<boolean> => {
    const transaction = await db
      .select()
      .from(coinTransactions)
      .where(
        and(
          eq(coinTransactions.type, TransactionType.QUESTION_ANSWER),
          sql`json_extract(${coinTransactions.metadata}, '$.context') = ${context}`,
          sql`json_extract(${coinTransactions.metadata}, '$.questionKey') = ${questionKey}`
        )
      )
      .get();
    return !!transaction;
  };

  const handleAnswer = async (questionKey: string, value: unknown) => {
    const newCache = { ...answersCache, [questionKey]: value };
    setAnswersCache(newCache);

    await saveAnswerMutation.mutateAsync({
      questionKey,
      answer: JSON.stringify(value),
    });

    // Award coin only if enabled and not already rewarded
    if (coinRewardPerQuestion > 0) {
      const hasReward = await checkQuestionReward(questionKey);

      if (!hasReward) {
        await awardCoinsMutation.mutateAsync({
          amount: coinRewardPerQuestion,
          type: TransactionType.QUESTION_ANSWER,
          metadata: { context, questionKey },
        });
        setAnimatingCoinIndex(currentIndex);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    if (allQuestions) {
      const hasDependents = allQuestions.some(
        (q) => q.dependsOnQuestionKey === questionKey,
      );
      if (hasDependents) {
        await deleteDependentAnswersMutation.mutateAsync({
          parentQuestionKey: questionKey,
        });

        const dependentQuestions = allQuestions.filter(
          (q) => q.dependsOnQuestionKey === questionKey,
        );
        const minDependentOrder = Math.min(
          ...dependentQuestions.map((q) => q.order),
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

  const handleFinish = async () => {
    onComplete();
  };

  const handleNext = () => {
    if (currentIndex < applicableQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#FFFFFF", "#F8F9FB"]}
      style={styles.gradient}
      testID="question-flow-gradient"
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "bottom"]}
        testID="safe-area-container"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
          testID="keyboard-avoiding-view"
        >
          <View style={styles.header} testID="question-flow-header">
            <View style={styles.headerRow}>
              <View
                style={currentIndex === 0 ? styles.backButtonHidden : undefined}
              >
                <TouchableOpacity
                  onPress={handleBack}
                  style={styles.backButton}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  testID="back-button"
                >
                  <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.spacer} />
              {coinRewardPerQuestion > 0 && <CoinCounter testID="coin-counter" />}
            </View>
            {coinRewardPerQuestion > 0 && (
              <CoinTrail
                testID="coin-trail"
                currentStep={currentIndex + 1}
                totalSteps={applicableQuestions.length}
                answeredQuestions={
                  existingAnswers?.map((a) => a.questionKey) ?? []
                }
                animatingCoinIndex={animatingCoinIndex}
                onCoinAnimationComplete={() => setAnimatingCoinIndex(null)}
              />
            )}
          </View>

          <View style={styles.contentArea}>
            <View style={styles.content}>
              {currentQuestion && (
                <Animated.View
                  style={styles.cardWrapper}
                  layout={Layout.springify().damping(20).stiffness(120)}
                >
                  <View style={styles.questionHeader}>
                    <QuestionText text={currentQuestion.questionText} />
                  </View>

                  <ScrollView
                    key={currentQuestion.key}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    testID="content-scroll-view"
                  >
                    <QuestionInput
                      question={currentQuestion}
                      value={
                        (answersCache[currentQuestion.key] as
                          | string
                          | number
                          | string[]
                          | undefined) ?? null
                      }
                      onChange={(value) =>
                        handleAnswer(currentQuestion.key, value)
                      }
                    />
                  </ScrollView>
                </Animated.View>
              )}
            </View>

            <View style={styles.footer} testID="question-flow-footer">
              {isAnswered && !isLastQuestion && (
                <Animated.View
                  entering={FadeInDown.springify().damping(12).stiffness(200)}
                  key={`next-${currentQuestion?.key}`}
                >
                  <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity
                      onPress={handleNext}
                      activeOpacity={0.7}
                      style={styles.nextButton}
                    >
                      <Text style={styles.buttonText}>Próxima →</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
              {isAnswered && isLastQuestion && (
                <Animated.View
                  entering={FadeInDown.springify().damping(12).stiffness(200)}
                  key={`finish-${currentQuestion?.key}`}
                >
                  <Animated.View style={buttonAnimatedStyle}>
                    <TouchableOpacity
                      onPress={handleFinish}
                      activeOpacity={0.7}
                      style={styles.finishButton}
                    >
                      <Text style={styles.finishButtonText}>✓ Concluir</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </Animated.View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  keyboardView: { flex: 1 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  spacer: { flex: 1 },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: spacing.sm,
  },
  backButtonHidden: {
    opacity: 0,
    pointerEvents: "none" as const,
  },
  backButtonText: {
    fontFamily: typographyPresets.subhead.fontFamily,
    fontSize: typography.fontSize.md,
    color: "#666666",
  },
  contentArea: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: "flex-start",
    minHeight: 0,
  },
  cardWrapper: {
    flex: 1,
    minHeight: 0,
  },
  questionHeader: {
    marginBottom: spacing.sm,
    flexShrink: 0,
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 88 },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  nextButton: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary.base,
    borderRadius: 28,
    shadowColor: colors.primary.base,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  finishButton: {
    width: "100%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#10B981",
    borderRadius: 28,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    ...typographyPresets.button,
    color: "#FFFFFF",
  },
  finishButtonText: {
    ...typographyPresets.button,
    color: "#FFFFFF",
  },
});
```

**Step 4: Run test to verify it passes**

```bash
npm test -- components/question-flow/QuestionFlowContainer.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add components/question-flow/QuestionFlowContainer.tsx components/question-flow/QuestionFlowContainer.test.tsx
git commit -m "feat(components): create generic QuestionFlowContainer with context and reward props"
```

---

#### Task 11: Update Onboarding Screen to Use QuestionFlowContainer

**Files:**
- Modify: `/Volumes/development/Tabagismo/app/onboarding.tsx`
- Modify: `/Volumes/development/Tabagismo/app/onboarding.test.tsx`

**Step 1: Write test for updated onboarding screen**

```typescript
// app/onboarding.test.tsx
import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { db } from '@/db/client';
import { questions, questionAnswers, settings } from '@/db/schema';
import OnboardingScreen from './onboarding';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OnboardingScreen', () => {
  beforeEach(async () => {
    await db.delete(questionAnswers).execute();
    await db.delete(questions).execute();
    await db.delete(settings).execute();
    mockRouter.replace.mockClear();
  });

  it('should render QuestionFlowContainer with onboarding context', async () => {
    await db.insert(questions).values([
      {
        context: 'onboarding',
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Qual é o seu nome?',
      },
    ]);

    const { getByText } = render(<OnboardingScreen />, {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(getByText(/Qual é o seu nome?/)).toBeTruthy();
    });
  });

  it('should complete onboarding and navigate to tabs', async () => {
    await db.insert(questions).values([
      {
        context: 'onboarding',
        key: 'name',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Qual é o seu nome?',
      },
    ]);

    const { getByText, getByTestId } = render(<OnboardingScreen />, {
      wrapper: createWrapper(),
    });

    // Answer question
    await waitFor(() => {
      const input = getByTestId('text-input');
      fireEvent.changeText(input, 'John');
    });

    // Complete onboarding
    const finishButton = getByText('✓ Concluir');
    fireEvent.press(finishButton);

    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/');
    });
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npm test -- app/onboarding.test.tsx
```

Expected: FAIL - "Cannot find QuestionFlowContainer"

**Step 3: Update onboarding screen to use QuestionFlowContainer**

```typescript
// app/onboarding.tsx
import { View, StyleSheet } from 'react-native';
import { QuestionFlowContainer } from '@/components/question-flow/QuestionFlowContainer';
import { useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboardingMutation.mutateAsync();
    router.replace('/(tabs)/' as any);
  };

  return (
    <View style={styles.container}>
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={handleComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

**Step 4: Run test to verify it passes**

```bash
npm test -- app/onboarding.test.tsx
```

Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding.tsx app/onboarding.test.tsx
git commit -m "refactor(app): use QuestionFlowContainer in onboarding screen"
```

---

#### Task 12: Move Component Files to question-flow Folder

**Files:**
- Move all files from `/components/onboarding/*` to `/components/question-flow/*`

**Step 1: Create question-flow directory and move files**

```bash
mkdir -p components/question-flow
cp -r components/onboarding/* components/question-flow/
```

**Step 2: Update all imports in moved files**

Search and replace in `components/question-flow/`:
- `from '@/components/onboarding/` → `from '@/components/question-flow/`
- `from './onboarding/` → `from './question-flow/`

**Step 3: Update imports in app/onboarding.tsx**

```typescript
// app/onboarding.tsx
import { QuestionFlowContainer } from '@/components/question-flow/QuestionFlowContainer';
```

**Step 4: Run all tests to ensure nothing broke**

```bash
npm test
```

Expected: PASS (all tests)

**Step 5: Remove old onboarding folder**

```bash
rm -rf components/onboarding
```

**Step 6: Commit**

```bash
git add components/question-flow app/onboarding.tsx
git rm -r components/onboarding
git commit -m "refactor(components): move onboarding components to question-flow folder"
```

---

### Phase 6: Cleanup & Documentation

#### Task 13: Delete Deprecated Repository

**Files:**
- Delete: `/Volumes/development/Tabagismo/db/repositories/onboarding.repository.ts`
- Delete: `/Volumes/development/Tabagismo/db/repositories/onboarding.repository.test.ts`
- Modify: `/Volumes/development/Tabagismo/db/repositories/index.ts`

**Step 1: Verify no imports of deprecated repository**

```bash
grep -r "from.*onboarding\.repository" --include="*.ts" --include="*.tsx" .
```

Expected: No results (all imports updated to use `questions.repository`)

**Step 2: Delete deprecated files**

```bash
rm db/repositories/onboarding.repository.ts
rm db/repositories/onboarding.repository.test.ts
```

**Step 3: Update repository index to remove export**

```typescript
// db/repositories/index.ts
export * from './settings.repository';
export * from './questions.repository';
export * from './users.repository';
export * from './coin-transactions.repository';
// REMOVED: export * from './onboarding.repository';
```

**Step 4: Run tests to ensure nothing broke**

```bash
npm test
```

Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/index.ts
git rm db/repositories/onboarding.repository.ts db/repositories/onboarding.repository.test.ts
git commit -m "refactor(repository): remove deprecated onboarding.repository"
```

---

#### Task 14: Delete Deprecated Schema

**Files:**
- Delete: `/Volumes/development/Tabagismo/db/schema/onboarding-answers.ts`
- Delete: `/Volumes/development/Tabagismo/db/schema/onboarding-answers.test.ts`
- Modify: `/Volumes/development/Tabagismo/db/schema/index.ts`

**Step 1: Verify no imports of deprecated schema**

```bash
grep -r "from.*onboarding-answers" --include="*.ts" --include="*.tsx" .
```

Expected: No results

**Step 2: Delete deprecated files**

```bash
rm db/schema/onboarding-answers.ts
rm db/schema/onboarding-answers.test.ts
```

**Step 3: Update schema index**

```typescript
// db/schema/index.ts
export * from './settings';
export * from './questions';
export * from './question-answers';
export * from './users';
export * from './coin-transactions';
// REMOVED: export * from './onboarding-answers';
```

**Step 4: Run tests**

```bash
npm test
```

Expected: PASS

**Step 5: Commit**

```bash
git add db/schema/index.ts
git rm db/schema/onboarding-answers.ts db/schema/onboarding-answers.test.ts
git commit -m "refactor(schema): remove deprecated onboarding-answers schema"
```

---

#### Task 15: Update Documentation

**Files:**
- Modify: `/Volumes/development/Tabagismo/db/CLAUDE.md`
- Modify: `/Volumes/development/Tabagismo/components/CLAUDE.md`
- Modify: `/Volumes/development/Tabagismo/app/CLAUDE.md`

**Step 1: Update db/CLAUDE.md**

Update sections:
- Remove references to `onboarding_answers` table
- Add `question_answers` table documentation
- Update repository hooks to show generic `useQuestions(context)` API
- Update query key patterns
- Update transaction types

**Step 2: Update components/CLAUDE.md**

Update sections:
- Rename "Onboarding Components" → "Question Flow Components"
- Update component names and paths
- Document `QuestionFlowContainer` props
- Update file paths from `onboarding/` to `question-flow/`

**Step 3: Update app/CLAUDE.md**

Update sections:
- Update onboarding screen documentation to reference `QuestionFlowContainer`
- Update imports

**Step 4: Commit**

```bash
git add db/CLAUDE.md components/CLAUDE.md app/CLAUDE.md
git commit -m "docs: update CLAUDE.md files for question flow refactor"
```

---

#### Task 16: Final Verification

**Step 1: Run full test suite**

```bash
npm test
```

Expected: PASS with ≥90% coverage

**Step 2: Run linter**

```bash
npm run lint
```

Expected: No errors

**Step 3: Test on iOS simulator**

```bash
npm start
# Press 'i' for iOS
```

Manual testing:
1. Clear app data
2. Launch app
3. Complete onboarding flow
4. Verify coins are awarded
5. Verify onboarding completes
6. Verify navigation to tabs

**Step 4: Test on Android emulator**

```bash
npm start
# Press 'a' for Android
```

Same manual tests as iOS

**Step 5: Commit final verification**

```bash
git add .
git commit -m "test: verify question flow refactor on iOS and Android"
```

---

## Success Criteria Checklist

✅ **Functional:**
- [ ] Onboarding flow works identically to before
- [ ] Questions scoped by context
- [ ] Answers saved with context
- [ ] Coins awarded based on `coinRewardPerQuestion` prop
- [ ] No duplicate coin awards (transaction-based check)
- [ ] Dependent question deletion respects context

✅ **Code Quality:**
- [ ] 90% test coverage maintained
- [ ] All tests passing (unit + integration)
- [ ] No TypeScript errors
- [ ] No ESLint warnings

✅ **Documentation:**
- [ ] CLAUDE.md files updated
- [ ] Design doc completed
- [ ] Breaking changes documented
- [ ] Migration guide clear

✅ **Future-Ready:**
- [ ] Easy to add new flows (just pass different `context`)
- [ ] API integration path clear
- [ ] No onboarding-specific code in generic components

---

## Notes for Implementer

1. **TDD Required**: Write tests first, then implementation. Use `--no-verify` to commit during red phase.

2. **Migration Testing**: Test migration on fresh install AND existing data. Clear app data between tests.

3. **Breaking Changes**: This refactor introduces breaking changes. All old hooks/components are replaced.

4. **Context Values**: Use string literals for context (e.g., `'onboarding'`, `'daily_checkin'`). Consider creating an enum in the future if contexts proliferate.

5. **Unique Constraint Caveat**: SQLite treats NULL as unique, so the `(context, questionKey, userId)` constraint allows multiple NULL userIds. This is acceptable for single-user app, but document this behavior.

6. **Transaction Type Migration**: Existing `ONBOARDING_ANSWER` transactions are migrated to `QUESTION_ANSWER` with context metadata. Old enum value is deprecated but not removed for backwards compat.

7. **Component Move Timing**: Components are moved LAST to avoid breaking tests mid-refactor. All logic changes happen first, then rename/move.

8. **Coin Reward Logic**: The `coinRewardPerQuestion` prop is optional (defaults to 0). When 0, coin-related UI (counter, trail) is hidden. When > 0, coins are awarded via transaction records, preventing duplicates.

---

**End of Implementation Plan**
