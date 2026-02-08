# Onboarding Feature Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a premium animated onboarding questionnaire with dynamic dependency-based flow and local SQLite persistence.

**Architecture:** Database-driven questions with TanStack Query caching, Reanimated multi-layer animations, and bidirectional navigation with dependency cascade. All answers auto-saved immediately for resumability.

**Tech Stack:** Drizzle ORM + expo-sqlite, TanStack Query v5, react-native-reanimated, expo-router, TypeScript

---

## Task 1: Database Schema - Questions Table

**Files:**
- Create: `db/schema/questions.ts`
- Modify: `db/schema/index.ts:1`
- Test: `db/schema/questions.test.ts`

**Step 1: Write the failing test**

```typescript
// db/schema/questions.test.ts
import { describe, it, expect } from '@jest/globals';
import { questions, QuestionType, QuestionCategory } from './questions';

describe('questions schema', () => {
  it('should have correct table name', () => {
    expect(questions._.name).toBe('questions');
  });

  it('should export QuestionType enum', () => {
    expect(QuestionType.TEXT).toBe('TEXT');
    expect(QuestionType.NUMBER).toBe('NUMBER');
    expect(QuestionType.SINGLE_CHOICE).toBe('SINGLE_CHOICE');
    expect(QuestionType.MULTIPLE_CHOICE).toBe('MULTIPLE_CHOICE');
  });

  it('should export QuestionCategory enum', () => {
    expect(QuestionCategory.PROFILE).toBe('PROFILE');
    expect(QuestionCategory.ADDICTION).toBe('ADDICTION');
    expect(QuestionCategory.HABITS).toBe('HABITS');
    expect(QuestionCategory.MOTIVATION).toBe('MOTIVATION');
    expect(QuestionCategory.GOALS).toBe('GOALS');
  });

  it('should have required columns', () => {
    const columns = questions._.columns;
    expect(columns.id).toBeDefined();
    expect(columns.key).toBeDefined();
    expect(columns.order).toBeDefined();
    expect(columns.type).toBeDefined();
    expect(columns.category).toBeDefined();
    expect(columns.questionText).toBeDefined();
    expect(columns.required).toBeDefined();
    expect(columns.dependsOnQuestionKey).toBeDefined();
    expect(columns.dependsOnValue).toBeDefined();
    expect(columns.metadata).toBeDefined();
    expect(columns.createdAt).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/schema/questions.test.ts`

Expected: FAIL with "Cannot find module './questions'"

**Step 3: Write minimal implementation**

```typescript
// db/schema/questions.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(),
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
    .$defaultFn(() => new Date()),
});

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

**Step 4: Export schema from index**

```typescript
// db/schema/index.ts
export * from './settings';
export * from './questions';
```

**Step 5: Run test to verify it passes**

Run: `npm test db/schema/questions.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add db/schema/questions.ts db/schema/questions.test.ts db/schema/index.ts
git commit -m "feat(db): add questions schema with enums"
```

---

## Task 2: Database Schema - Onboarding Answers Table

**Files:**
- Create: `db/schema/onboarding-answers.ts`
- Modify: `db/schema/index.ts:2`
- Test: `db/schema/onboarding-answers.test.ts`

**Step 1: Write the failing test**

```typescript
// db/schema/onboarding-answers.test.ts
import { describe, it, expect } from '@jest/globals';
import { onboardingAnswers } from './onboarding-answers';

describe('onboardingAnswers schema', () => {
  it('should have correct table name', () => {
    expect(onboardingAnswers._.name).toBe('onboarding_answers');
  });

  it('should have required columns', () => {
    const columns = onboardingAnswers._.columns;
    expect(columns.id).toBeDefined();
    expect(columns.questionKey).toBeDefined();
    expect(columns.userId).toBeDefined();
    expect(columns.answer).toBeDefined();
    expect(columns.answeredAt).toBeDefined();
    expect(columns.updatedAt).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/schema/onboarding-answers.test.ts`

Expected: FAIL with "Cannot find module './onboarding-answers'"

**Step 3: Write minimal implementation**

```typescript
// db/schema/onboarding-answers.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const onboardingAnswers = sqliteTable('onboarding_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type OnboardingAnswer = typeof onboardingAnswers.$inferSelect;
export type NewOnboardingAnswer = typeof onboardingAnswers.$inferInsert;
```

**Step 4: Export schema from index**

```typescript
// db/schema/index.ts (append)
export * from './onboarding-answers';
```

**Step 5: Run test to verify it passes**

Run: `npm test db/schema/onboarding-answers.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add db/schema/onboarding-answers.ts db/schema/onboarding-answers.test.ts db/schema/index.ts
git commit -m "feat(db): add onboarding_answers schema"
```

---

## Task 3: Generate and Convert Database Migrations

**Files:**
- Generate: `db/migrations/0001_*.sql` (via drizzle-kit)
- Create: `db/migrations/0001_add_onboarding_tables.ts`
- Modify: `db/migrations/migrations.ts`

**Step 1: Generate migration from schemas**

Run: `npm run db:generate`

Expected: Creates `db/migrations/0001_*.sql` file

**Step 2: Convert SQL to TypeScript module**

Read the generated SQL file and create TypeScript version:

```typescript
// db/migrations/0001_add_onboarding_tables.ts
export default `CREATE TABLE \`questions\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`key\` text NOT NULL UNIQUE,
  \`order\` integer NOT NULL,
  \`type\` text NOT NULL,
  \`category\` text NOT NULL,
  \`question_text\` text NOT NULL,
  \`required\` integer DEFAULT 1 NOT NULL,
  \`depends_on_question_key\` text,
  \`depends_on_value\` text,
  \`metadata\` text,
  \`created_at\` integer NOT NULL
);

CREATE TABLE \`onboarding_answers\` (
  \`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  \`question_key\` text NOT NULL,
  \`user_id\` integer,
  \`answer\` text NOT NULL,
  \`answered_at\` integer NOT NULL,
  \`updated_at\` integer NOT NULL
);
`;
```

**Step 3: Register migration in migrations.ts**

```typescript
// db/migrations/migrations.ts
import m0000 from './0000_initial';
import m0001 from './0001_add_onboarding_tables';
import journal from './meta/_journal.json';

export default {
  journal,
  migrations: {
    m0000,
    m0001,
  },
};
```

**Step 4: Test migration runs successfully**

Run: `npm start` (check console for migration logs)

Expected: Console shows "[DB] Migrations completed successfully"

**Step 5: Commit**

```bash
git add db/migrations/0001_add_onboarding_tables.ts db/migrations/migrations.ts db/migrations/meta/
git commit -m "feat(db): add onboarding tables migration"
```

---

## Task 4: Flow Engine Logic - Dependency Resolution

**Files:**
- Create: `lib/onboarding-flow.ts`
- Test: `lib/onboarding-flow.test.ts`

**Step 1: Write the failing test**

```typescript
// lib/onboarding-flow.test.ts
import { describe, it, expect } from '@jest/globals';
import { computeApplicableQuestions } from './onboarding-flow';
import type { Question } from '@/db/schema';

describe('computeApplicableQuestions', () => {
  const mockQuestions: Question[] = [
    {
      id: 1,
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Qual é o seu nome?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: 2,
      key: 'addiction_type',
      order: 2,
      type: 'SINGLE_CHOICE',
      category: 'ADDICTION',
      questionText: 'Qual é o seu vício?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: { choices: ['Cigarro/Tabaco', 'Pod/Vape'] },
      createdAt: new Date(),
    },
    {
      id: 3,
      key: 'cigarettes_per_day',
      order: 3,
      type: 'NUMBER',
      category: 'HABITS',
      questionText: 'Quantos cigarros por dia?',
      required: true,
      dependsOnQuestionKey: 'addiction_type',
      dependsOnValue: 'Cigarro/Tabaco',
      metadata: {},
      createdAt: new Date(),
    },
    {
      id: 4,
      key: 'pod_duration_days',
      order: 4,
      type: 'NUMBER',
      category: 'HABITS',
      questionText: 'Quantos dias dura um pod?',
      required: true,
      dependsOnQuestionKey: 'addiction_type',
      dependsOnValue: 'Pod/Vape',
      metadata: {},
      createdAt: new Date(),
    },
  ];

  it('should return all questions when no dependencies', () => {
    const result = computeApplicableQuestions(mockQuestions, {});
    expect(result).toHaveLength(2); // Only name and addiction_type
    expect(result[0].key).toBe('name');
    expect(result[1].key).toBe('addiction_type');
  });

  it('should show cigarette questions when addiction_type is Cigarro', () => {
    const answers = { addiction_type: 'Cigarro/Tabaco' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result).toHaveLength(3);
    expect(result.find(q => q.key === 'cigarettes_per_day')).toBeDefined();
    expect(result.find(q => q.key === 'pod_duration_days')).toBeUndefined();
  });

  it('should show pod questions when addiction_type is Pod', () => {
    const answers = { addiction_type: 'Pod/Vape' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result).toHaveLength(3);
    expect(result.find(q => q.key === 'pod_duration_days')).toBeDefined();
    expect(result.find(q => q.key === 'cigarettes_per_day')).toBeUndefined();
  });

  it('should maintain order by order field', () => {
    const answers = { addiction_type: 'Cigarro/Tabaco' };
    const result = computeApplicableQuestions(mockQuestions, answers);

    expect(result[0].order).toBe(1);
    expect(result[1].order).toBe(2);
    expect(result[2].order).toBe(3);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test lib/onboarding-flow.test.ts`

Expected: FAIL with "Cannot find module './onboarding-flow'"

**Step 3: Write minimal implementation**

```typescript
// lib/onboarding-flow.ts
import type { Question } from '@/db/schema';

export function computeApplicableQuestions(
  allQuestions: Question[],
  answers: Record<string, any>
): Question[] {
  return allQuestions
    .sort((a, b) => a.order - b.order)
    .filter(question => {
      // No dependency = always show
      if (!question.dependsOnQuestionKey) return true;

      // Has dependency = check if parent answer matches
      const parentAnswer = answers[question.dependsOnQuestionKey];
      return parentAnswer === question.dependsOnValue;
    });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test lib/onboarding-flow.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/onboarding-flow.ts lib/onboarding-flow.test.ts
git commit -m "feat(lib): add dependency resolution for onboarding flow"
```

---

## Task 5: Flow Engine Logic - Progress Calculation

**Files:**
- Modify: `lib/onboarding-flow.ts`
- Modify: `lib/onboarding-flow.test.ts`

**Step 1: Write the failing test**

```typescript
// lib/onboarding-flow.test.ts (append)
describe('calculateProgress', () => {
  it('should calculate percentage based on applicable questions', () => {
    const answered = 5;
    const total = 10;
    const result = calculateProgress(answered, total);
    expect(result).toBe(50);
  });

  it('should return 0 when no questions answered', () => {
    const result = calculateProgress(0, 10);
    expect(result).toBe(0);
  });

  it('should return 100 when all questions answered', () => {
    const result = calculateProgress(10, 10);
    expect(result).toBe(100);
  });

  it('should handle edge case of 0 total questions', () => {
    const result = calculateProgress(0, 0);
    expect(result).toBe(0);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test lib/onboarding-flow.test.ts`

Expected: FAIL with "calculateProgress is not defined"

**Step 3: Write minimal implementation**

```typescript
// lib/onboarding-flow.ts (append)
export function calculateProgress(answeredCount: number, totalCount: number): number {
  if (totalCount === 0) return 0;
  return Math.round((answeredCount / totalCount) * 100);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test lib/onboarding-flow.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add lib/onboarding-flow.ts lib/onboarding-flow.test.ts
git commit -m "feat(lib): add progress calculation for onboarding"
```

---

## Task 6: Repository Hooks - Queries

**Files:**
- Create: `db/repositories/onboarding.repository.ts`
- Modify: `db/repositories/index.ts`
- Test: `db/repositories/onboarding.repository.test.ts`

**Step 1: Write the failing test**

```typescript
// db/repositories/onboarding.repository.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOnboardingQuestions, useOnboardingAnswers } from './onboarding.repository';
import { db } from '../client';
import { questions, onboardingAnswers } from '../schema';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOnboardingQuestions', () => {
  beforeEach(async () => {
    // Clean database
    await db.delete(questions).execute();
  });

  it('should return empty array when no questions', async () => {
    const { result } = renderHook(() => useOnboardingQuestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should return questions ordered by order field', async () => {
    // Insert test questions
    await db.insert(questions).values([
      {
        key: 'q2',
        order: 2,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Second question',
        required: true,
      },
      {
        key: 'q1',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'First question',
        required: true,
      },
    ]);

    const { result } = renderHook(() => useOnboardingQuestions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].key).toBe('q1');
    expect(result.current.data?.[1].key).toBe('q2');
  });
});

describe('useOnboardingAnswers', () => {
  beforeEach(async () => {
    await db.delete(onboardingAnswers).execute();
  });

  it('should return empty array when no answers', async () => {
    const { result } = renderHook(() => useOnboardingAnswers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it('should return all answers', async () => {
    await db.insert(onboardingAnswers).values([
      { questionKey: 'name', answer: JSON.stringify('John') },
      { questionKey: 'age', answer: JSON.stringify(30) },
    ]);

    const { result } = renderHook(() => useOnboardingAnswers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: FAIL with "Cannot find module './onboarding.repository'"

**Step 3: Write minimal implementation**

```typescript
// db/repositories/onboarding.repository.ts
import { useQuery } from '@tanstack/react-query';
import { db } from '../client';
import { questions, onboardingAnswers } from '../schema';

export function useOnboardingQuestions() {
  return useQuery({
    queryKey: ['onboarding', 'questions'],
    queryFn: async () => {
      return await db
        .select()
        .from(questions)
        .orderBy(questions.order)
        .all();
    },
  });
}

export function useOnboardingAnswers() {
  return useQuery({
    queryKey: ['onboarding', 'answers'],
    queryFn: async () => {
      return await db
        .select()
        .from(onboardingAnswers)
        .all();
    },
  });
}
```

**Step 4: Export from index**

```typescript
// db/repositories/index.ts (append)
export * from './onboarding.repository';
```

**Step 5: Run test to verify it passes**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: PASS

**Step 6: Commit**

```bash
git add db/repositories/onboarding.repository.ts db/repositories/onboarding.repository.test.ts db/repositories/index.ts
git commit -m "feat(db): add onboarding query hooks"
```

---

## Task 7: Repository Hooks - Save Answer Mutation

**Files:**
- Modify: `db/repositories/onboarding.repository.ts`
- Modify: `db/repositories/onboarding.repository.test.ts`

**Step 1: Write the failing test**

```typescript
// db/repositories/onboarding.repository.test.ts (append)
import { useSaveAnswer } from './onboarding.repository';
import { eq } from 'drizzle-orm';

describe('useSaveAnswer', () => {
  beforeEach(async () => {
    await db.delete(onboardingAnswers).execute();
  });

  it('should insert new answer if not exists', async () => {
    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    await result.current.mutateAsync({
      questionKey: 'name',
      answer: JSON.stringify('John'),
    });

    const saved = await db
      .select()
      .from(onboardingAnswers)
      .where(eq(onboardingAnswers.questionKey, 'name'))
      .get();

    expect(saved).toBeDefined();
    expect(saved?.answer).toBe(JSON.stringify('John'));
  });

  it('should update existing answer if exists', async () => {
    // Insert initial answer
    await db.insert(onboardingAnswers).values({
      questionKey: 'name',
      answer: JSON.stringify('John'),
    });

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    await result.current.mutateAsync({
      questionKey: 'name',
      answer: JSON.stringify('Jane'),
    });

    const updated = await db
      .select()
      .from(onboardingAnswers)
      .where(eq(onboardingAnswers.questionKey, 'name'))
      .get();

    expect(updated?.answer).toBe(JSON.stringify('Jane'));
  });

  it('should update updatedAt timestamp on update', async () => {
    const initialTime = new Date('2024-01-01');
    await db.insert(onboardingAnswers).values({
      questionKey: 'name',
      answer: JSON.stringify('John'),
      answeredAt: initialTime,
      updatedAt: initialTime,
    });

    const { result } = renderHook(() => useSaveAnswer(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    await result.current.mutateAsync({
      questionKey: 'name',
      answer: JSON.stringify('Jane'),
    });

    const updated = await db
      .select()
      .from(onboardingAnswers)
      .where(eq(onboardingAnswers.questionKey, 'name'))
      .get();

    expect(updated?.updatedAt.getTime()).toBeGreaterThan(initialTime.getTime());
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: FAIL with "useSaveAnswer is not defined"

**Step 3: Write minimal implementation**

```typescript
// db/repositories/onboarding.repository.ts (append)
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';

export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionKey,
      answer,
    }: {
      questionKey: string;
      answer: string;
    }) => {
      const existing = await db
        .select()
        .from(onboardingAnswers)
        .where(eq(onboardingAnswers.questionKey, questionKey))
        .get();

      if (existing) {
        return await db
          .update(onboardingAnswers)
          .set({
            answer,
            updatedAt: new Date(),
          })
          .where(eq(onboardingAnswers.questionKey, questionKey))
          .returning();
      } else {
        return await db
          .insert(onboardingAnswers)
          .values({ questionKey, answer })
          .returning();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'answers'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding.repository.ts db/repositories/onboarding.repository.test.ts
git commit -m "feat(db): add save answer mutation hook"
```

---

## Task 8: Repository Hooks - Delete Dependent Answers Mutation

**Files:**
- Modify: `db/repositories/onboarding.repository.ts`
- Modify: `db/repositories/onboarding.repository.test.ts`

**Step 1: Write the failing test**

```typescript
// db/repositories/onboarding.repository.test.ts (append)
import { useDeleteDependentAnswers } from './onboarding.repository';

describe('useDeleteDependentAnswers', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
    await db.delete(onboardingAnswers).execute();
  });

  it('should delete answers for dependent questions', async () => {
    // Setup questions with dependencies
    await db.insert(questions).values([
      {
        key: 'addiction_type',
        order: 1,
        type: 'SINGLE_CHOICE',
        category: 'ADDICTION',
        questionText: 'Vício?',
        required: true,
      },
      {
        key: 'cigarettes_per_day',
        order: 2,
        type: 'NUMBER',
        category: 'HABITS',
        questionText: 'Cigarros por dia?',
        required: true,
        dependsOnQuestionKey: 'addiction_type',
        dependsOnValue: 'Cigarro/Tabaco',
      },
    ]);

    // Setup answers
    await db.insert(onboardingAnswers).values([
      { questionKey: 'addiction_type', answer: JSON.stringify('Cigarro/Tabaco') },
      { questionKey: 'cigarettes_per_day', answer: JSON.stringify(20) },
    ]);

    const { result } = renderHook(() => useDeleteDependentAnswers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    await result.current.mutateAsync({ parentQuestionKey: 'addiction_type' });

    const remaining = await db.select().from(onboardingAnswers).all();

    // Only addiction_type should remain
    expect(remaining).toHaveLength(1);
    expect(remaining[0].questionKey).toBe('addiction_type');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: FAIL with "useDeleteDependentAnswers is not defined"

**Step 3: Write minimal implementation**

```typescript
// db/repositories/onboarding.repository.ts (append)
export function useDeleteDependentAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentQuestionKey }: { parentQuestionKey: string }) => {
      // Get all questions that depend on this parent
      const allQuestions = await db.select().from(questions).all();
      const dependentQuestions = allQuestions.filter(
        q => q.dependsOnQuestionKey === parentQuestionKey
      );

      // Delete answers for dependent questions
      for (const question of dependentQuestions) {
        await db
          .delete(onboardingAnswers)
          .where(eq(onboardingAnswers.questionKey, question.key))
          .execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'answers'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test db/repositories/onboarding.repository.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/onboarding.repository.ts db/repositories/onboarding.repository.test.ts
git commit -m "feat(db): add delete dependent answers mutation"
```

---

## Task 9: UI Component - QuestionText

**Files:**
- Create: `components/onboarding/QuestionText.tsx`
- Test: `components/onboarding/QuestionText.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/QuestionText.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { QuestionText } from './QuestionText';

describe('QuestionText', () => {
  it('should render question text', () => {
    render(<QuestionText text="Qual é o seu nome?" />);
    expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
  });

  it('should apply large font size', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    expect(element.props.style).toMatchObject({
      fontSize: 24,
    });
  });

  it('should apply bold weight', () => {
    render(<QuestionText text="Test question" />);
    const element = screen.getByText('Test question');
    expect(element.props.style).toMatchObject({
      fontWeight: '700',
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/QuestionText.test.tsx`

Expected: FAIL with "Cannot find module './QuestionText'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/QuestionText.tsx
import { Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface QuestionTextProps {
  text: string;
}

export function QuestionText({ text }: QuestionTextProps) {
  const color = useThemeColor({}, 'text');

  return <Text style={[styles.text, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/QuestionText.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/QuestionText.tsx components/onboarding/QuestionText.test.tsx
git commit -m "feat(components): add QuestionText component"
```

---

## Task 10: UI Component - TextInput

**Files:**
- Create: `components/onboarding/inputs/TextInput.tsx`
- Test: `components/onboarding/inputs/TextInput.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/inputs/TextInput.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingTextInput } from './TextInput';

describe('OnboardingTextInput', () => {
  it('should render with placeholder', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByPlaceholderText('Nome')).toBeDefined();
  });

  it('should call onChange when text changes', () => {
    const onChange = jest.fn();
    render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

    const input = screen.getByPlaceholderText('Nome');
    fireEvent.changeText(input, 'John');

    expect(onChange).toHaveBeenCalledWith('John');
  });

  it('should display current value', () => {
    render(<OnboardingTextInput value="John" onChange={() => {}} placeholder="Nome" />);
    expect(screen.getByDisplayValue('John')).toBeDefined();
  });

  it('should have large font size', () => {
    render(<OnboardingTextInput value="" onChange={() => {}} placeholder="Nome" />);
    const input = screen.getByPlaceholderText('Nome');
    expect(input.props.style).toMatchObject({
      fontSize: 18,
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/inputs/TextInput.test.tsx`

Expected: FAIL with "Cannot find module './TextInput'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/inputs/TextInput.tsx
import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface OnboardingTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function OnboardingTextInput({ value, onChange, placeholder }: OnboardingTextInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={borderColor}
        style={[styles.input, { color, borderBottomColor: borderColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/inputs/TextInput.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/inputs/TextInput.tsx components/onboarding/inputs/TextInput.test.tsx
git commit -m "feat(components): add TextInput component for onboarding"
```

---

## Task 11: UI Component - NumberInput

**Files:**
- Create: `components/onboarding/inputs/NumberInput.tsx`
- Test: `components/onboarding/inputs/NumberInput.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/inputs/NumberInput.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingNumberInput } from './NumberInput';

describe('OnboardingNumberInput', () => {
  it('should render with placeholder', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByPlaceholderText('Idade')).toBeDefined();
  });

  it('should have numeric keyboard', () => {
    render(<OnboardingNumberInput value={null} onChange={() => {}} placeholder="Idade" />);
    const input = screen.getByPlaceholderText('Idade');
    expect(input.props.keyboardType).toBe('numeric');
  });

  it('should call onChange with number when valid', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByPlaceholderText('Idade');
    fireEvent.changeText(input, '25');

    expect(onChange).toHaveBeenCalledWith(25);
  });

  it('should not call onChange when invalid number', () => {
    const onChange = jest.fn();
    render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

    const input = screen.getByPlaceholderText('Idade');
    fireEvent.changeText(input, 'abc');

    expect(onChange).not.toHaveBeenCalled();
  });

  it('should display current value', () => {
    render(<OnboardingNumberInput value={25} onChange={() => {}} placeholder="Idade" />);
    expect(screen.getByDisplayValue('25')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/inputs/NumberInput.test.tsx`

Expected: FAIL with "Cannot find module './NumberInput'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/inputs/NumberInput.tsx
import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

interface OnboardingNumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  placeholder: string;
}

export function OnboardingNumberInput({ value, onChange, placeholder }: OnboardingNumberInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value?.toString() ?? ''}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={borderColor}
        keyboardType="numeric"
        style={[styles.input, { color, borderBottomColor: borderColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/inputs/NumberInput.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/inputs/NumberInput.tsx components/onboarding/inputs/NumberInput.test.tsx
git commit -m "feat(components): add NumberInput component for onboarding"
```

---

## Task 12: UI Component - SingleChoiceCards

**Files:**
- Create: `components/onboarding/inputs/SingleChoiceCards.tsx`
- Test: `components/onboarding/inputs/SingleChoiceCards.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/inputs/SingleChoiceCards.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { SingleChoiceCards } from './SingleChoiceCards';

describe('SingleChoiceCards', () => {
  const choices = ['Masculino', 'Feminino', 'Outro'];

  it('should render all choices', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    expect(screen.getByText('Masculino')).toBeDefined();
    expect(screen.getByText('Feminino')).toBeDefined();
    expect(screen.getByText('Outro')).toBeDefined();
  });

  it('should call onChange when card is pressed', () => {
    const onChange = jest.fn();
    render(<SingleChoiceCards choices={choices} value={null} onChange={onChange} />);

    fireEvent.press(screen.getByText('Masculino'));
    expect(onChange).toHaveBeenCalledWith('Masculino');
  });

  it('should highlight selected card', () => {
    render(<SingleChoiceCards choices={choices} value="Feminino" onChange={() => {}} />);
    const selected = screen.getByText('Feminino').parent;
    // Check for selected styling (would need testID in actual implementation)
    expect(selected).toBeDefined();
  });

  it('should render cards as touchable', () => {
    render(<SingleChoiceCards choices={choices} value={null} onChange={() => {}} />);
    const card = screen.getByText('Masculino').parent;
    expect(card?.props.accessible).toBe(true);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/inputs/SingleChoiceCards.test.tsx`

Expected: FAIL with "Cannot find module './SingleChoiceCards'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/inputs/SingleChoiceCards.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/useThemeColor';

interface SingleChoiceCardsProps {
  choices: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceCards({ choices, value, onChange }: SingleChoiceCardsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(choice);
  };

  return (
    <View style={styles.container}>
      {choices.map((choice) => {
        const isSelected = value === choice;
        return (
          <TouchableOpacity
            key={choice}
            onPress={() => handlePress(choice)}
            style={[
              styles.card,
              { backgroundColor },
              isSelected && { backgroundColor: tint, borderColor: tint },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? backgroundColor : text }]}>
              {choice}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/inputs/SingleChoiceCards.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/inputs/SingleChoiceCards.tsx components/onboarding/inputs/SingleChoiceCards.test.tsx
git commit -m "feat(components): add SingleChoiceCards component"
```

---

## Task 13: UI Component - MultipleChoiceCards

**Files:**
- Create: `components/onboarding/inputs/MultipleChoiceCards.tsx`
- Test: `components/onboarding/inputs/MultipleChoiceCards.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/inputs/MultipleChoiceCards.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { MultipleChoiceCards } from './MultipleChoiceCards';

describe('MultipleChoiceCards', () => {
  const choices = ['Ansiedade', 'Estresse', 'Social'];

  it('should render all choices', () => {
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Estresse')).toBeDefined();
    expect(screen.getByText('Social')).toBeDefined();
  });

  it('should add choice when card is pressed', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={[]} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(onChange).toHaveBeenCalledWith(['Ansiedade']);
  });

  it('should remove choice when selected card is pressed', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={onChange} />);

    fireEvent.press(screen.getByText('Ansiedade'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('should allow multiple selections', () => {
    const onChange = jest.fn();
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade']} onChange={onChange} />);

    fireEvent.press(screen.getByText('Estresse'));
    expect(onChange).toHaveBeenCalledWith(['Ansiedade', 'Estresse']);
  });

  it('should highlight all selected cards', () => {
    render(<MultipleChoiceCards choices={choices} value={['Ansiedade', 'Social']} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Social')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/inputs/MultipleChoiceCards.test.tsx`

Expected: FAIL with "Cannot find module './MultipleChoiceCards'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/inputs/MultipleChoiceCards.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/useThemeColor';

interface MultipleChoiceCardsProps {
  choices: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultipleChoiceCards({ choices, value, onChange }: MultipleChoiceCardsProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');

  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isSelected = value.includes(choice);
    if (isSelected) {
      onChange(value.filter(v => v !== choice));
    } else {
      onChange([...value, choice]);
    }
  };

  return (
    <View style={styles.container}>
      {choices.map((choice) => {
        const isSelected = value.includes(choice);
        return (
          <TouchableOpacity
            key={choice}
            onPress={() => handlePress(choice)}
            style={[
              styles.card,
              { backgroundColor },
              isSelected && { backgroundColor: tint, borderColor: tint },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? backgroundColor : text }]}>
              {choice}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 12,
  },
  card: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/inputs/MultipleChoiceCards.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/inputs/MultipleChoiceCards.tsx components/onboarding/inputs/MultipleChoiceCards.test.tsx
git commit -m "feat(components): add MultipleChoiceCards component"
```

---

## Task 14: UI Component - ProgressBar

**Files:**
- Create: `components/onboarding/ProgressBar.tsx`
- Test: `components/onboarding/ProgressBar.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/ProgressBar.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('should render progress percentage text', () => {
    render(<ProgressBar progress={50} />);
    expect(screen.getByText('50%')).toBeDefined();
  });

  it('should show 0% when progress is 0', () => {
    render(<ProgressBar progress={0} />);
    expect(screen.getByText('0%')).toBeDefined();
  });

  it('should show 100% when progress is 100', () => {
    render(<ProgressBar progress={100} />);
    expect(screen.getByText('100%')).toBeDefined();
  });

  it('should render progress bar container', () => {
    const { container } = render(<ProgressBar progress={50} />);
    expect(container).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/ProgressBar.test.tsx`

Expected: FAIL with "Cannot find module './ProgressBar'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/ProgressBar.tsx
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useEffect } from 'react';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const tint = useThemeColor({}, 'tint');
  const text = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'border');

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, { damping: 15 });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.track, { backgroundColor }]}>
        <Animated.View style={[styles.fill, { backgroundColor: tint }, animatedStyle]} />
      </View>
      <Text style={[styles.text, { color: text }]}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/ProgressBar.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/ProgressBar.tsx components/onboarding/ProgressBar.test.tsx
git commit -m "feat(components): add animated ProgressBar component"
```

---

## Task 15: UI Component - QuestionCard Container

**Files:**
- Create: `components/onboarding/QuestionCard.tsx`
- Test: `components/onboarding/QuestionCard.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/QuestionCard.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { QuestionCard } from './QuestionCard';

describe('QuestionCard', () => {
  it('should render children', () => {
    render(
      <QuestionCard>
        <Text>Test content</Text>
      </QuestionCard>
    );
    expect(screen.getByText('Test content')).toBeDefined();
  });

  it('should apply container styles', () => {
    const { container } = render(
      <QuestionCard>
        <Text>Test</Text>
      </QuestionCard>
    );
    expect(container).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/QuestionCard.test.tsx`

Expected: FAIL with "Cannot find module './QuestionCard'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/QuestionCard.tsx
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

interface QuestionCardProps {
  children: React.ReactNode;
}

export function QuestionCard({ children }: QuestionCardProps) {
  return (
    <Animated.View style={styles.container}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    width: '100%',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/QuestionCard.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/QuestionCard.tsx components/onboarding/QuestionCard.test.tsx
git commit -m "feat(components): add QuestionCard container component"
```

---

## Task 16: Onboarding Container - State Management

**Files:**
- Create: `components/onboarding/OnboardingContainer.tsx`
- Test: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/OnboardingContainer.test.tsx
import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OnboardingContainer } from './OnboardingContainer';
import { db } from '@/db/client';
import { questions } from '@/db/schema';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('OnboardingContainer', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
  });

  it('should render loading state initially', () => {
    render(<OnboardingContainer />, { wrapper: createWrapper() });
    expect(screen.getByTestId('loading')).toBeDefined();
  });

  it('should render first question after loading', async () => {
    await db.insert(questions).values({
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Qual é o seu nome?',
      required: true,
    });

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Qual é o seu nome?')).toBeDefined();
    });
  });

  it('should show progress bar', async () => {
    await db.insert(questions).values({
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Qual é o seu nome?',
      required: true,
    });

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeDefined();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: FAIL with "Cannot find module './OnboardingContainer'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useOnboardingQuestions, useOnboardingAnswers } from '@/db/repositories';
import { computeApplicableQuestions, calculateProgress } from '@/lib/onboarding-flow';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuestionText } from './QuestionText';
import type { Question } from '@/db/schema';

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, any>>({});
  const [applicableQuestions, setApplicableQuestions] = useState<Question[]>([]);

  const { data: allQuestions, isLoading: questionsLoading } = useOnboardingQuestions();
  const { data: existingAnswers, isLoading: answersLoading } = useOnboardingAnswers();

  const isLoading = questionsLoading || answersLoading;

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;

    // Load existing answers into cache
    const cache = existingAnswers.reduce((acc, answer) => {
      acc[answer.questionKey] = JSON.parse(answer.answer);
      return acc;
    }, {} as Record<string, any>);

    setAnswersCache(cache);

    // Compute applicable questions
    const applicable = computeApplicableQuestions(allQuestions, cache);
    setApplicableQuestions(applicable);

    // Find first unanswered question
    const firstUnanswered = applicable.findIndex(q => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="loading">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const currentQuestion = applicableQuestions[currentIndex];
  const answeredCount = Object.keys(answersCache).filter(key =>
    applicableQuestions.some(q => q.key === key)
  ).length;
  const progress = calculateProgress(answeredCount, applicableQuestions.length);

  return (
    <View style={styles.container}>
      <ProgressBar progress={progress} />
      {currentQuestion && (
        <QuestionCard>
          <QuestionText text={currentQuestion.questionText} />
        </QuestionCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(components): add OnboardingContainer with state management"
```

---

## Task 17: Onboarding Container - Question Input Factory

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Create: `components/onboarding/QuestionInput.tsx`
- Test: `components/onboarding/QuestionInput.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/QuestionInput.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import { QuestionInput } from './QuestionInput';
import type { Question } from '@/db/schema';

describe('QuestionInput', () => {
  it('should render TextInput for TEXT type', () => {
    const question: Question = {
      id: 1,
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Nome?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: {},
      createdAt: new Date(),
    };

    render(<QuestionInput question={question} value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Digite sua resposta')).toBeDefined();
  });

  it('should render NumberInput for NUMBER type', () => {
    const question: Question = {
      id: 2,
      key: 'age',
      order: 2,
      type: 'NUMBER',
      category: 'PROFILE',
      questionText: 'Idade?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: {},
      createdAt: new Date(),
    };

    render(<QuestionInput question={question} value={null} onChange={() => {}} />);
    expect(screen.getByPlaceholderText('Digite um número')).toBeDefined();
  });

  it('should render SingleChoiceCards for SINGLE_CHOICE type', () => {
    const question: Question = {
      id: 3,
      key: 'gender',
      order: 3,
      type: 'SINGLE_CHOICE',
      category: 'PROFILE',
      questionText: 'Gênero?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: { choices: ['Masculino', 'Feminino'] },
      createdAt: new Date(),
    };

    render(<QuestionInput question={question} value={null} onChange={() => {}} />);
    expect(screen.getByText('Masculino')).toBeDefined();
    expect(screen.getByText('Feminino')).toBeDefined();
  });

  it('should render MultipleChoiceCards for MULTIPLE_CHOICE type', () => {
    const question: Question = {
      id: 4,
      key: 'triggers',
      order: 4,
      type: 'MULTIPLE_CHOICE',
      category: 'HABITS',
      questionText: 'Gatilhos?',
      required: true,
      dependsOnQuestionKey: null,
      dependsOnValue: null,
      metadata: { choices: ['Ansiedade', 'Estresse'] },
      createdAt: new Date(),
    };

    render(<QuestionInput question={question} value={[]} onChange={() => {}} />);
    expect(screen.getByText('Ansiedade')).toBeDefined();
    expect(screen.getByText('Estresse')).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/QuestionInput.test.tsx`

Expected: FAIL with "Cannot find module './QuestionInput'"

**Step 3: Write minimal implementation**

```typescript
// components/onboarding/QuestionInput.tsx
import type { Question } from '@/db/schema';
import { OnboardingTextInput } from './inputs/TextInput';
import { OnboardingNumberInput } from './inputs/NumberInput';
import { SingleChoiceCards } from './inputs/SingleChoiceCards';
import { MultipleChoiceCards } from './inputs/MultipleChoiceCards';

interface QuestionInputProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export function QuestionInput({ question, value, onChange }: QuestionInputProps) {
  switch (question.type) {
    case 'TEXT':
      return (
        <OnboardingTextInput
          value={value ?? ''}
          onChange={onChange}
          placeholder="Digite sua resposta"
        />
      );

    case 'NUMBER':
      return (
        <OnboardingNumberInput
          value={value}
          onChange={onChange}
          placeholder="Digite um número"
        />
      );

    case 'SINGLE_CHOICE':
      return (
        <SingleChoiceCards
          choices={(question.metadata as any)?.choices ?? []}
          value={value}
          onChange={onChange}
        />
      );

    case 'MULTIPLE_CHOICE':
      return (
        <MultipleChoiceCards
          choices={(question.metadata as any)?.choices ?? []}
          value={value ?? []}
          onChange={onChange}
        />
      );

    default:
      return null;
  }
}
```

**Step 4: Update OnboardingContainer to use QuestionInput**

```typescript
// components/onboarding/OnboardingContainer.tsx (update render)
import { QuestionInput } from './QuestionInput';

// In render section, after QuestionText:
{currentQuestion && (
  <QuestionCard>
    <QuestionText text={currentQuestion.questionText} />
    <QuestionInput
      question={currentQuestion}
      value={answersCache[currentQuestion.key]}
      onChange={(value) => handleAnswer(currentQuestion.key, value)}
    />
  </QuestionCard>
)}
```

**Step 5: Run test to verify it passes**

Run: `npm test components/onboarding/QuestionInput.test.tsx`

Expected: PASS

**Step 6: Commit**

```bash
git add components/onboarding/QuestionInput.tsx components/onboarding/QuestionInput.test.tsx components/onboarding/OnboardingContainer.tsx
git commit -m "feat(components): add QuestionInput factory component"
```

---

## Task 18: Onboarding Container - Answer Handling

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/OnboardingContainer.test.tsx (append)
import { fireEvent } from '@testing-library/react-native';

describe('OnboardingContainer - Answer Handling', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
    await db.delete(onboardingAnswers).execute();
  });

  it('should save answer when input changes', async () => {
    await db.insert(questions).values({
      key: 'name',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Nome?',
      required: true,
    });

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Digite sua resposta')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'João');

    await waitFor(async () => {
      const saved = await db
        .select()
        .from(onboardingAnswers)
        .where(eq(onboardingAnswers.questionKey, 'name'))
        .get();
      expect(saved).toBeDefined();
    });
  });

  it('should update progress after answering', async () => {
    await db.insert(questions).values([
      {
        key: 'q1',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'First?',
        required: true,
      },
      {
        key: 'q2',
        order: 2,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Second?',
        required: true,
      },
    ]);

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('0%')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeDefined();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: FAIL with "handleAnswer is not defined"

**Step 3: Add answer handling to OnboardingContainer**

```typescript
// components/onboarding/OnboardingContainer.tsx (add imports and handler)
import { useSaveAnswer } from '@/db/repositories';

// Inside component:
const saveAnswerMutation = useSaveAnswer();

const handleAnswer = async (questionKey: string, value: any) => {
  // Update cache immediately (optimistic)
  const newCache = { ...answersCache, [questionKey]: value };
  setAnswersCache(newCache);

  // Save to database
  await saveAnswerMutation.mutateAsync({
    questionKey,
    answer: JSON.stringify(value),
  });

  // Recalculate applicable questions
  if (allQuestions) {
    const newApplicable = computeApplicableQuestions(allQuestions, newCache);
    setApplicableQuestions(newApplicable);
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(components): add answer handling and saving logic"
```

---

## Task 19: Onboarding Container - Navigation Controls

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/OnboardingContainer.test.tsx (append)
describe('OnboardingContainer - Navigation', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
    await db.delete(onboardingAnswers).execute();

    await db.insert(questions).values([
      {
        key: 'q1',
        order: 1,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'First?',
        required: true,
      },
      {
        key: 'q2',
        order: 2,
        type: 'TEXT',
        category: 'PROFILE',
        questionText: 'Second?',
        required: true,
      },
    ]);
  });

  it('should show next button when question is answered', async () => {
    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima')).toBeDefined();
    });
  });

  it('should advance to next question when next is pressed', async () => {
    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Answer');

    await waitFor(() => {
      expect(screen.getByText('Próxima')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Próxima'));

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });
  });

  it('should show back button after first question', async () => {
    await db.insert(onboardingAnswers).values({
      questionKey: 'q1',
      answer: JSON.stringify('Answer'),
    });

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
      expect(screen.getByText('Voltar')).toBeDefined();
    });
  });

  it('should go back when back button is pressed', async () => {
    await db.insert(onboardingAnswers).values({
      questionKey: 'q1',
      answer: JSON.stringify('Answer'),
    });

    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    fireEvent.press(screen.getByText('Voltar'));

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: FAIL with "Unable to find element with text: Próxima"

**Step 3: Add navigation controls to OnboardingContainer**

```typescript
// components/onboarding/OnboardingContainer.tsx (add at end of component)
import { TouchableOpacity } from 'react-native';

const handleNext = () => {
  if (currentIndex < applicableQuestions.length - 1) {
    setCurrentIndex(currentIndex + 1);
  }
};

const handleBack = () => {
  if (currentIndex > 0) {
    setCurrentIndex(currentIndex - 1);
  }
};

const currentAnswer = currentQuestion ? answersCache[currentQuestion.key] : null;
const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== '';

// In render, after QuestionCard:
<View style={styles.navigationContainer}>
  {currentIndex > 0 && (
    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
      <Text style={styles.buttonText}>Voltar</Text>
    </TouchableOpacity>
  )}
  {isAnswered && (
    <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
      <Text style={styles.buttonText}>Próxima</Text>
    </TouchableOpacity>
  )}
</View>

// Add styles:
navigationContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 24,
},
backButton: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: '#ccc',
  borderRadius: 8,
},
nextButton: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  backgroundColor: '#007AFF',
  borderRadius: 8,
  marginLeft: 'auto',
},
buttonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#fff',
},
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(components): add navigation controls (back/next)"
```

---

## Task 20: Onboarding Screen Route

**Files:**
- Create: `app/onboarding.tsx`
- Test: `app/onboarding.test.tsx`

**Step 1: Write the failing test**

```typescript
// app/onboarding.test.tsx
import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react-native';
import OnboardingScreen from './onboarding';

describe('OnboardingScreen', () => {
  it('should render OnboardingContainer', () => {
    render(<OnboardingScreen />);
    expect(screen.getByTestId('loading')).toBeDefined(); // Initial loading state
  });

  it('should render full screen', () => {
    const { container } = render(<OnboardingScreen />);
    expect(container).toBeDefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test app/onboarding.test.tsx`

Expected: FAIL with "Cannot find module './onboarding'"

**Step 3: Write minimal implementation**

```typescript
// app/onboarding.tsx
import { View, StyleSheet } from 'react-native';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <OnboardingContainer />
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

Run: `npm test app/onboarding.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/onboarding.tsx app/onboarding.test.tsx
git commit -m "feat(app): add onboarding screen route"
```

---

## Task 21: Register Onboarding Route in Layout

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Read current _layout.tsx**

Run: `cat app/_layout.tsx`

**Step 2: Add onboarding route configuration**

```typescript
// app/_layout.tsx (add to Stack.Screen list)
<Stack.Screen
  name="onboarding"
  options={{
    presentation: 'modal',
    headerShown: false,
    gestureEnabled: false,
  }}
/>
```

**Step 3: Test that app still runs**

Run: `npm start`

Expected: App starts without errors

**Step 4: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(app): register onboarding route as modal"
```

---

## Task 22: Add Onboarding Completion Setting

**Files:**
- Modify: `db/repositories/settings.repository.ts`
- Test: `db/repositories/settings.repository.test.ts`

**Step 1: Write the failing test**

```typescript
// db/repositories/settings.repository.test.ts (append)
import { useOnboardingStatus, useCompleteOnboarding } from './settings.repository';

describe('useOnboardingStatus', () => {
  beforeEach(async () => {
    await db.delete(settings).execute();
  });

  it('should return false when onboarding not completed', async () => {
    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(false);
  });

  it('should return true when onboarding is completed', async () => {
    await db.insert(settings).values({
      key: 'onboarding_completed',
      value: 'true',
    });

    const { result } = renderHook(() => useOnboardingStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBe(true);
  });
});

describe('useCompleteOnboarding', () => {
  beforeEach(async () => {
    await db.delete(settings).execute();
  });

  it('should set onboarding_completed to true', async () => {
    const { result } = renderHook(() => useCompleteOnboarding(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current).toBeDefined());

    await result.current.mutateAsync();

    const setting = await db
      .select()
      .from(settings)
      .where(eq(settings.key, 'onboarding_completed'))
      .get();

    expect(setting?.value).toBe('true');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test db/repositories/settings.repository.test.ts`

Expected: FAIL with "useOnboardingStatus is not defined"

**Step 3: Add onboarding status hooks**

```typescript
// db/repositories/settings.repository.ts (append)
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['settings', 'onboarding_completed'],
    queryFn: async () => {
      const setting = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'onboarding_completed'))
        .get();
      return setting?.value === 'true';
    },
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const existing = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'onboarding_completed'))
        .get();

      if (existing) {
        await db
          .update(settings)
          .set({ value: 'true', updatedAt: new Date() })
          .where(eq(settings.key, 'onboarding_completed'));
      } else {
        await db.insert(settings).values({
          key: 'onboarding_completed',
          value: 'true',
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', 'onboarding_completed'] });
    },
  });
}
```

**Step 4: Run test to verify it passes**

Run: `npm test db/repositories/settings.repository.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add db/repositories/settings.repository.ts db/repositories/settings.repository.test.ts
git commit -m "feat(db): add onboarding completion status hooks"
```

---

## Task 23: Add Onboarding Check in Root Layout

**Files:**
- Modify: `app/_layout.tsx`
- Test: `app/_layout.test.tsx`

**Step 1: Write the failing test**

```typescript
// app/_layout.test.tsx (append)
import { useOnboardingStatus } from '@/db/repositories';

jest.mock('@/db/repositories', () => ({
  ...jest.requireActual('@/db/repositories'),
  useOnboardingStatus: jest.fn(),
}));

describe('RootLayout - Onboarding Check', () => {
  it('should navigate to onboarding when not completed', async () => {
    (useOnboardingStatus as jest.Mock).mockReturnValue({
      data: false,
      isLoading: false,
    });

    const { router } = render(<RootLayout />);

    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/onboarding');
    });
  });

  it('should not navigate when onboarding is completed', async () => {
    (useOnboardingStatus as jest.Mock).mockReturnValue({
      data: true,
      isLoading: false,
    });

    const { router } = render(<RootLayout />);

    await waitFor(() => {
      expect(router.replace).not.toHaveBeenCalledWith('/onboarding');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test app/_layout.test.tsx`

Expected: FAIL (router.replace not called)

**Step 3: Add onboarding check to root layout**

```typescript
// app/_layout.tsx (add after migrations)
import { useOnboardingStatus } from '@/db/repositories';
import { useRouter } from 'expo-router';

// Inside component:
const router = useRouter();
const { data: onboardingCompleted, isLoading } = useOnboardingStatus();

useEffect(() => {
  if (!isLoading && onboardingCompleted === false) {
    router.replace('/onboarding');
  }
}, [onboardingCompleted, isLoading]);
```

**Step 4: Run test to verify it passes**

Run: `npm test app/_layout.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add app/_layout.tsx app/_layout.test.tsx
git commit -m "feat(app): add onboarding completion check in root layout"
```

---

## Task 24: Complete Onboarding on Last Question

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx`
- Modify: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write the failing test**

```typescript
// components/onboarding/OnboardingContainer.test.tsx (append)
import { useCompleteOnboarding } from '@/db/repositories';

describe('OnboardingContainer - Completion', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
    await db.delete(onboardingAnswers).execute();

    await db.insert(questions).values({
      key: 'q1',
      order: 1,
      type: 'TEXT',
      category: 'PROFILE',
      questionText: 'Only question?',
      required: true,
    });
  });

  it('should complete onboarding when last question answered', async () => {
    render(<OnboardingContainer />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Only question?')).toBeDefined();
    });

    const input = screen.getByPlaceholderText('Digite sua resposta');
    fireEvent.changeText(input, 'Final answer');

    await waitFor(async () => {
      const setting = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'onboarding_completed'))
        .get();
      expect(setting?.value).toBe('true');
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: FAIL (onboarding_completed not set)

**Step 3: Add completion logic to handleAnswer**

```typescript
// components/onboarding/OnboardingContainer.tsx
import { useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';

// Inside component:
const router = useRouter();
const completeOnboardingMutation = useCompleteOnboarding();

// In handleAnswer function, after recalculating applicable:
const answeredKeys = Object.keys(newCache);
const allAnswered = newApplicable.every(q => answeredKeys.includes(q.key));

if (allAnswered) {
  // Mark onboarding complete
  await completeOnboardingMutation.mutateAsync();
  // Navigate to tabs
  router.replace('/(tabs)');
}
```

**Step 4: Run test to verify it passes**

Run: `npm test components/onboarding/OnboardingContainer.test.tsx`

Expected: PASS

**Step 5: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx components/onboarding/OnboardingContainer.test.tsx
git commit -m "feat(components): complete onboarding and navigate on finish"
```

---

## Task 25: Add Question Card Animations

**Files:**
- Modify: `components/onboarding/QuestionCard.tsx`

**Step 1: Add animation shared values and effects**

```typescript
// components/onboarding/QuestionCard.tsx
import { useEffect } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface QuestionCardProps {
  children: React.ReactNode;
  direction?: 'forward' | 'back';
}

export function QuestionCard({ children, direction = 'forward' }: QuestionCardProps) {
  const translateX = useSharedValue(SCREEN_WIDTH * 0.3);
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Animate in
    translateX.value = withSpring(0, { damping: 20, stiffness: 90 });
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}
```

**Step 2: Test animation runs smoothly**

Run: `npm start` and navigate to onboarding

Expected: Question card slides in with scale and fade

**Step 3: Commit**

```bash
git add components/onboarding/QuestionCard.tsx
git commit -m "feat(components): add slide/scale/fade animations to QuestionCard"
```

---

## Task 26: Seed Initial Questions Data

**Files:**
- Create: `assets/data/onboarding-questions.csv`
- Create: `db/seed/seed-questions.ts`
- Test: `db/seed/seed-questions.test.ts`

**Step 1: Create CSV with initial questions**

```csv
key,order,type,category,questionText,dependsOnQuestionKey,dependsOnValue,metadata
name,1,TEXT,PROFILE,"Qual é o seu nome?",,,"{}",
gender,2,SINGLE_CHOICE,PROFILE,"Qual é o seu gênero?",,,"{"choices":["Masculino","Feminino","Outro"]}",
age,3,NUMBER,PROFILE,"Qual é a sua idade?",,,"{}",
addiction_type,4,SINGLE_CHOICE,ADDICTION,"Qual é o seu vício?",,,"{"choices":["Cigarro/Tabaco","Pod/Vape"]}",
cigarettes_per_day,5,NUMBER,HABITS,"Quantos cigarros você fuma por dia?",addiction_type,"Cigarro/Tabaco","{}",
pod_duration_days,6,NUMBER,HABITS,"Quantos dias dura um pod?",addiction_type,"Pod/Vape","{}",
years_smoking,7,NUMBER,HABITS,"Há quantos anos você fuma?",,,"{}",
quit_attempts,8,NUMBER,MOTIVATION,"Quantas vezes você já tentou parar?",,,"{}",
main_motivation,9,SINGLE_CHOICE,MOTIVATION,"Qual é sua principal motivação para parar?",,,"{"choices":["Saúde","Economia","Família","Aparência"]}",
goals,10,MULTIPLE_CHOICE,GOALS,"Quais são seus objetivos?",,,"{"choices":["Melhorar saúde","Economizar dinheiro","Dar exemplo","Ter mais energia"]}",
```

**Step 2: Write seed script test**

```typescript
// db/seed/seed-questions.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { seedOnboardingQuestions } from './seed-questions';
import { db } from '../client';
import { questions } from '../schema';

describe('seedOnboardingQuestions', () => {
  beforeEach(async () => {
    await db.delete(questions).execute();
  });

  it('should seed questions from CSV', async () => {
    await seedOnboardingQuestions();

    const allQuestions = await db.select().from(questions).all();
    expect(allQuestions.length).toBeGreaterThan(0);
  });

  it('should seed questions in correct order', async () => {
    await seedOnboardingQuestions();

    const allQuestions = await db.select().from(questions).orderBy(questions.order).all();
    expect(allQuestions[0].key).toBe('name');
    expect(allQuestions[1].key).toBe('gender');
  });
});
```

**Step 3: Write seed script**

```typescript
// db/seed/seed-questions.ts
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { db } from '../client';
import { questions } from '../schema';

export async function seedOnboardingQuestions() {
  // Load CSV asset
  const asset = Asset.fromModule(require('../../assets/data/onboarding-questions.csv'));
  await asset.downloadAsync();

  const csvContent = await FileSystem.readAsStringAsync(asset.localUri!);
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');

  const questionData = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      return {
        key: values[0],
        order: parseInt(values[1]),
        type: values[2],
        category: values[3],
        questionText: values[4].replace(/"/g, ''),
        dependsOnQuestionKey: values[5] || null,
        dependsOnValue: values[6] || null,
        required: true,
        metadata: values[7] ? JSON.parse(values[7]) : {},
      };
    });

  // Clear existing
  await db.delete(questions).execute();

  // Insert all
  await db.insert(questions).values(questionData);

  console.log(`[SEED] Inserted ${questionData.length} questions`);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test db/seed/seed-questions.test.ts`

Expected: PASS

**Step 5: Commit**

```bash
git add assets/data/onboarding-questions.csv db/seed/seed-questions.ts db/seed/seed-questions.test.ts
git commit -m "feat(db): add question seeding from CSV"
```

---

## Task 27: Auto-Seed on App Launch

**Files:**
- Modify: `app/_layout.tsx`

**Step 1: Add seed check after migrations**

```typescript
// app/_layout.tsx (after migrations run)
import { seedOnboardingQuestions } from '@/db/seed/seed-questions';
import { questions } from '@/db/schema';

// After migrations:
const existingQuestions = await db.select().from(questions).all();
if (existingQuestions.length === 0) {
  await seedOnboardingQuestions();
}
```

**Step 2: Test on fresh install**

Run: `npm start` (with empty database)

Expected: Console shows "[SEED] Inserted 10 questions"

**Step 3: Commit**

```bash
git add app/_layout.tsx
git commit -m "feat(app): auto-seed questions on fresh install"
```

---

## Task 28: Run Full Test Suite and Verify Coverage

**Step 1: Run all tests**

Run: `npm test`

Expected: All tests pass

**Step 2: Check coverage**

Run: `npm run test:coverage`

Expected: Coverage >= 90%

**Step 3: If coverage < 90%, identify gaps**

Run: `npm run test:coverage -- --verbose`

Check uncovered lines and add missing tests

**Step 4: Commit any additional tests**

```bash
git add .
git commit -m "test: improve coverage to meet 90% threshold"
```

---

## Task 29: End-to-End Manual Testing

**Step 1: Test fresh install flow**

1. Clear app data
2. Launch app
3. Verify onboarding appears
4. Answer first question
5. Verify progress updates
6. Complete all questions
7. Verify navigation to tabs

**Step 2: Test resume flow**

1. Answer 3 questions
2. Close app
3. Relaunch app
4. Verify resumes at question 4

**Step 3: Test dependency flow**

1. Select "Cigarro/Tabaco" for addiction type
2. Verify cigarette questions appear
3. Go back and change to "Pod/Vape"
4. Verify cigarette answers deleted
5. Verify pod questions appear

**Step 4: Document any bugs found**

Create issues for bugs, fix if critical

**Step 5: Final commit**

```bash
git add .
git commit -m "test: complete end-to-end onboarding testing"
```

---

## Task 30: Update CLAUDE.md Files

**Files:**
- Create/Update: `components/onboarding/CLAUDE.md`
- Update: `CLAUDE.md`

**Step 1: Create onboarding component guide**

```markdown
# Onboarding Components

Premium animated questionnaire flow with dynamic dependencies.

## Components

### OnboardingContainer
Main state management container. Handles:
- Answer caching
- Progress calculation
- Navigation between questions
- Dependency resolution
- Completion detection

### QuestionCard
Animated card wrapper with slide/scale/fade entrance.

### QuestionText
Large, bold question display.

### QuestionInput
Factory component that renders appropriate input based on question type.

### Inputs
- TextInput: Floating label text input
- NumberInput: Numeric keyboard input
- SingleChoiceCards: Tappable card selection
- MultipleChoiceCards: Multi-select cards

### ProgressBar
Animated progress indicator with spring physics.

## Usage

```typescript
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

<OnboardingContainer />
```

## Flow Logic

See `/lib/onboarding-flow.ts` for dependency resolution and progress calculation.

## Database

- Questions stored in `questions` table
- Answers stored in `onboarding_answers` table
- See `/db/schema/` for schemas
```

**Step 2: Update root CLAUDE.md**

Add onboarding feature to "Common Tasks" section

**Step 3: Commit**

```bash
git add components/onboarding/CLAUDE.md CLAUDE.md
git commit -m "docs: add onboarding feature documentation"
```

---

## Success Criteria Checklist

- [ ] Database schemas created (questions, onboarding_answers)
- [ ] Migrations generated and converted to .ts
- [ ] Repository hooks implemented (queries + mutations)
- [ ] Flow engine logic (dependency resolution, progress calc)
- [ ] All UI components created (inputs, cards, progress bar)
- [ ] OnboardingContainer with full state management
- [ ] Onboarding screen route registered
- [ ] Root layout checks onboarding status
- [ ] Completion logic and navigation
- [ ] Question seeding from CSV
- [ ] Animations (slide, scale, fade, spring)
- [ ] 90% test coverage achieved
- [ ] TDD approach followed throughout
- [ ] CLAUDE.md files updated

---

## Notes

- **TDD Workflow:** Red → Green → Refactor for every task
- **Commit Frequency:** After each passing test (green phase)
- **Use --no-verify:** During red phase to commit failing tests
- **Dependencies:** Questions depend on parent answers via `dependsOnQuestionKey`
- **Animations:** Use react-native-reanimated for smooth 60fps animations
- **Repository Pattern:** Never access `db` directly in components
