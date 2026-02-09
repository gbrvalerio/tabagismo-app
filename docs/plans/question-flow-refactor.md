# Generic Question/Answer Flow System

**Status:** Approved
**Date:** 2026-02-08
**Author:** Claude Code

---

## Overview

Refactor the question/answer system from onboarding-specific to a generic, reusable system that supports multiple flows throughout the app (onboarding, daily check-ins, mood tracking, assessments, etc.).

---

## Motivation

### Current Problems

1. **Tight Coupling:** Question/answer logic is hardcoded to onboarding
   - Table names: `onboarding_answers`
   - Hook names: `useOnboardingQuestions()`, `useOnboardingAnswers()`
   - Components: `OnboardingContainer`, `OnboardingGuard`
   - Query keys: `['onboarding', 'questions']`

2. **Not Reusable:** Cannot use the same system for other flows
   - Daily check-ins would need duplicate code
   - Mood tracking would need duplicate code
   - Each new flow = copy/paste entire system

3. **Inflexible Rewards:** Coin logic is embedded in components
   - Hard to configure different reward amounts
   - Hard to disable rewards for certain flows

### Goals

- ✅ **Decouple** question/answer system from onboarding context
- ✅ **Reusable** across multiple flows (onboarding, daily check-ins, mood tracking)
- ✅ **Flexible rewards** defined by caller, not database schema
- ✅ **Future-proof** for API integration
- ✅ **Maintainable** with clear separation of concerns

---

## Design Decisions

### 1. Context-Based Architecture

**Decision:** Use a `context` field to distinguish question flows

**Rationale:**
- Simple, flexible, no additional tables needed
- Same question key can exist in different contexts
- Easy to query: `WHERE context = 'onboarding'`
- Supports future flows without schema changes

**Alternatives Considered:**
- **Separate tables per flow** — Too rigid, schema changes for each new flow
- **Flow metadata table** — Over-engineered for current needs
- **No context, shared questions** — User wanted separate questions per flow

**Implementation:**
```typescript
// questions table
context: text('context').notNull()  // 'onboarding', 'daily_checkin', 'mood_tracker'
```

---

### 2. Generic Answer Storage

**Decision:** Rename `onboarding_answers` → `question_answers` with context field

**Rationale:**
- Centralizes all answers in one table
- Unique constraint: `(context, questionKey, userId)` allows same question in different flows
- Answers are logically separated by context
- Simple migration path

**Schema:**
```typescript
export const questionAnswers = sqliteTable('question_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull(),
  questionKey: text('question_key').notNull(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Unique constraint: (context, questionKey, userId)
```

**Why not separate tables?**
- Violates DRY principle
- Harder to maintain (N tables instead of 1)
- Schema changes needed for each new flow
- Queries become repetitive

---

### 3. Caller-Defined Rewards

**Decision:** Coin rewards configured via component props, not database schema

**Rationale:**
- Flexibility: Different flows can award different amounts (or none)
- No database bloat: Reward config doesn't belong in data model
- Testability: Easy to test with/without rewards
- Business logic: Reward rules can change without migrations

**Implementation:**
```typescript
<QuestionFlowContainer
  context="onboarding"
  coinRewardPerQuestion={1}  // ← Caller defines reward
  onComplete={() => {}}
/>

<QuestionFlowContainer
  context="daily_checkin"
  coinRewardPerQuestion={0}  // ← No rewards for check-ins
  onComplete={() => {}}
/>
```

**Transaction Metadata:**
```typescript
// Generic transaction type
enum TransactionType {
  QUESTION_ANSWER = 'question_answer',  // Was: ONBOARDING_ANSWER
  // ...
}

// Metadata includes context
metadata: {
  context: 'onboarding',
  questionKey: 'name'
}
```

**Why not store reward amount in questions table?**
- Reward is a flow-level decision, not question-level
- Same question in different flows might have different rewards
- Keeps data model clean (questions = domain, rewards = business logic)

---

### 4. Repository Layer API

**Decision:** Generic hooks with context parameter

**API:**
```typescript
// Generic base hooks
export function useQuestions(context: string)
export function useAnswers(context: string)
export function useSaveAnswer(context: string)
export function useDeleteDependentAnswers(context: string)
export function useDeleteAllAnswers(context: string)
export function useHasQuestionReward(context: string, questionKey: string)
```

**Usage:**
```typescript
// In components
const { data: questions } = useQuestions('onboarding');
const { data: answers } = useAnswers('daily_checkin');
const saveAnswer = useSaveAnswer('mood_tracker');
```

**Rationale:**
- **Explicit context** — No magic, caller specifies which flow
- **Type-safe** — TypeScript enforces context parameter
- **Query key scoped** — `['questions', context]` prevents cache collisions
- **Breaking change OK** — No MVP yet, clean slate

**Why not convenience wrappers?**
```typescript
// Could do this:
export const useOnboardingQuestions = () => useQuestions('onboarding');
```
- Adds indirection without value
- More exports to maintain
- Context parameter is clear enough

---

### 5. Component Architecture

**Decision:** Generic `QuestionFlowContainer` component

**Props:**
```typescript
export interface QuestionFlowProps {
  context: string;                    // Which flow (onboarding, daily_checkin, etc.)
  onComplete: () => void;             // Callback when all questions answered
  coinRewardPerQuestion?: number;     // Coins per question (0 = no rewards)
}
```

**Usage:**
```typescript
// Onboarding screen
<QuestionFlowContainer
  context="onboarding"
  coinRewardPerQuestion={1}
  onComplete={() => {
    completeOnboarding();
    router.replace('/(tabs)');
  }}
/>

// Daily check-in screen
<QuestionFlowContainer
  context="daily_checkin"
  coinRewardPerQuestion={0}
  onComplete={() => router.back()}
/>
```

**Rationale:**
- **Inversion of control** — Caller defines completion behavior
- **Configuration over code** — Props define behavior, not hardcoded
- **Testable** — Easy to test with different props
- **Reusable** — Same component for all flows

**Component Hierarchy:**
```
QuestionFlowContainer
├── QuestionText
├── QuestionInput (factory)
│   ├── OnboardingTextInput
│   ├── OnboardingNumberInput
│   ├── SingleChoiceCards
│   └── MultipleChoiceCards
├── CoinCounter (conditional: coinRewardPerQuestion > 0)
├── CoinTrail (conditional: coinRewardPerQuestion > 0)
└── Navigation buttons
```

**What about flow-specific features?**
- For now: Keep it simple (coins are sufficient)
- Future: Add feature flags as needed
  ```typescript
  features?: {
    showProgressBar?: boolean;
    enableBackButton?: boolean;
    animationStyle?: 'default' | 'minimal';
  }
  ```

---

### 6. File Structure Refactor

**Before:**
```
/lib
  /onboarding-flow.ts          # Flow logic
/db/schema
  /onboarding-answers.ts       # Answers table
/db/repositories
  /onboarding.repository.ts    # Hooks
/components/onboarding
  /OnboardingContainer.tsx
  /QuestionText.tsx
  /QuestionInput.tsx
  /...
```

**After:**
```
/lib
  /question-flow.ts            # Generic flow logic (renamed)
/db/schema
  /question-answers.ts         # Generic answers table (renamed)
/db/repositories
  /questions.repository.ts     # Generic hooks (new)
/components/question-flow      # Renamed folder
  /QuestionFlowContainer.tsx   # Generic container (renamed)
  /QuestionText.tsx            # Unchanged
  /QuestionInput.tsx           # Unchanged
  /inputs/                     # Unchanged
  /CoinCounter.tsx             # Unchanged
  /CoinTrail.tsx               # Unchanged
```

**Breaking Changes:**
- ❌ `useOnboardingQuestions()` → ✅ `useQuestions('onboarding')`
- ❌ `useOnboardingAnswers()` → ✅ `useAnswers('onboarding')`
- ❌ `onboarding_answers` table → ✅ `question_answers` table
- ❌ `TransactionType.ONBOARDING_ANSWER` → ✅ `TransactionType.QUESTION_ANSWER`
- ❌ `lib/onboarding-flow.ts` → ✅ `lib/question-flow.ts`
- ❌ `components/onboarding/*` → ✅ `components/question-flow/*`

**Migration Safety:**
- Breaking changes acceptable (no MVP yet)
- Data migration preserves all existing answers
- Tests updated to use new API
- 90% coverage requirement maintained

---

## Data Model

### Questions Table (Updated)

```typescript
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull(),              // NEW: 'onboarding', 'daily_checkin', etc.
  key: text('key').notNull(),                      // Unique within context
  order: integer('order').notNull(),
  type: text('type').notNull(),                    // TEXT, NUMBER, SINGLE_CHOICE, MULTIPLE_CHOICE
  category: text('category').notNull(),            // PROFILE, ADDICTION, HABITS, etc.
  questionText: text('question_text').notNull(),
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  dependsOnQuestionKey: text('depends_on_question_key'),
  dependsOnValue: text('depends_on_value'),
  metadata: text('metadata', { mode: 'json' }),    // { choices: [...] }
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// Composite unique constraint: (context, key)
```

**Changes:**
- ✅ Added `context` field
- ✅ `key` is unique within context (not globally)

**Examples:**
```typescript
// Onboarding question
{ context: 'onboarding', key: 'name', questionText: 'Qual é o seu nome?' }

// Daily check-in question (same key, different context)
{ context: 'daily_checkin', key: 'name', questionText: 'Como você quer ser chamado hoje?' }
```

---

### Question Answers Table (New)

```typescript
export const questionAnswers = sqliteTable('question_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  context: text('context').notNull(),
  questionKey: text('question_key').notNull(),
  userId: integer('user_id'),
  answer: text('answer').notNull(),               // JSON stringified
  answeredAt: integer('answered_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

// Unique constraint: (context, questionKey, userId)
```

**Changes:**
- ✅ Renamed from `onboarding_answers`
- ✅ Added `context` field
- ✅ Removed `coinAwarded` field (deprecated, use transactions)
- ✅ Unique constraint includes context

**Query Examples:**
```sql
-- Get all onboarding answers
SELECT * FROM question_answers WHERE context = 'onboarding';

-- Get specific answer
SELECT * FROM question_answers
WHERE context = 'onboarding' AND question_key = 'name' AND user_id = 1;

-- Check if user answered in any context
SELECT context, answer FROM question_answers
WHERE question_key = 'mood' AND user_id = 1;
```

---

### Coin Transactions (Updated Metadata)

```typescript
export enum TransactionType {
  QUESTION_ANSWER = 'question_answer',  // Generic (was: ONBOARDING_ANSWER)
  DAILY_REWARD = 'daily_reward',
  PURCHASE = 'purchase',
  BONUS = 'bonus',
}

// Metadata examples:
{
  context: 'onboarding',
  questionKey: 'name'
}

{
  context: 'daily_checkin',
  questionKey: 'mood'
}
```

**Query to check if question rewarded:**
```sql
SELECT * FROM coin_transactions
WHERE type = 'question_answer'
  AND json_extract(metadata, '$.context') = 'onboarding'
  AND json_extract(metadata, '$.questionKey') = 'name';
```

---

## Migration Strategy

### Database Migration (0007_genericize_questions.sql)

```sql
-- 1. Add context to questions (default to 'onboarding' for existing rows)
ALTER TABLE questions ADD COLUMN context TEXT NOT NULL DEFAULT 'onboarding';

-- 2. Create new question_answers table
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
CREATE UNIQUE INDEX question_answers_context_key_user_idx
  ON question_answers (context, question_key, user_id);

-- 3. Migrate data from onboarding_answers
--> statement-breakpoint
INSERT INTO question_answers (context, question_key, user_id, answer, answered_at, updated_at)
SELECT 'onboarding', question_key, user_id, answer, answered_at, updated_at
FROM onboarding_answers;

-- 4. Drop old table
--> statement-breakpoint
DROP TABLE onboarding_answers;
```

**Data Integrity:**
- ✅ All existing answers preserved
- ✅ Context set to 'onboarding' for existing data
- ✅ Unique constraints enforced
- ✅ No data loss

---

## Testing Strategy

### Unit Tests (90% Coverage Required)

**Schema Tests:**
```typescript
// db/schema/question-answers.test.ts
describe('question_answers schema', () => {
  it('should insert answer with context', async () => {
    const result = await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'name',
      answer: '"John"',
    });
    expect(result).toBeDefined();
  });

  it('should enforce unique constraint on (context, questionKey, userId)', async () => {
    // Insert first answer
    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'name',
      userId: 1,
      answer: '"John"',
    });

    // Duplicate in same context should fail
    await expect(
      db.insert(questionAnswers).values({
        context: 'onboarding',
        questionKey: 'name',
        userId: 1,
        answer: '"Jane"',
      })
    ).rejects.toThrow();
  });

  it('should allow same questionKey in different contexts', async () => {
    await db.insert(questionAnswers).values({
      context: 'onboarding',
      questionKey: 'mood',
      answer: '"happy"',
    });

    await db.insert(questionAnswers).values({
      context: 'daily_checkin',
      questionKey: 'mood',
      answer: '"sad"',
    });

    const answers = await db.select().from(questionAnswers).all();
    expect(answers).toHaveLength(2);
  });
});
```

**Repository Tests:**
```typescript
// db/repositories/questions.repository.test.ts
describe('useQuestions', () => {
  it('should fetch questions for specific context', async () => {
    // Seed questions
    await db.insert(questions).values([
      { context: 'onboarding', key: 'name', order: 1, /* ... */ },
      { context: 'daily_checkin', key: 'mood', order: 1, /* ... */ },
    ]);

    const { result } = renderHook(() => useQuestions('onboarding'));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(1);
    expect(result.current.data[0].context).toBe('onboarding');
  });
});

describe('useSaveAnswer', () => {
  it('should save answer with context', async () => {
    const { result } = renderHook(() => useSaveAnswer('onboarding'));

    await act(() =>
      result.current.mutate({
        questionKey: 'name',
        answer: '"John"',
      })
    );

    const saved = await db.select().from(questionAnswers).all();
    expect(saved[0].context).toBe('onboarding');
    expect(saved[0].questionKey).toBe('name');
  });

  it('should update existing answer on conflict', async () => {
    const { result } = renderHook(() => useSaveAnswer('onboarding'));

    // First save
    await act(() =>
      result.current.mutate({ questionKey: 'name', answer: '"John"' })
    );

    // Update
    await act(() =>
      result.current.mutate({ questionKey: 'name', answer: '"Jane"' })
    );

    const answers = await db.select().from(questionAnswers).all();
    expect(answers).toHaveLength(1);
    expect(answers[0].answer).toBe('"Jane"');
  });
});
```

**Component Tests:**
```typescript
// components/question-flow/QuestionFlowContainer.test.tsx
describe('QuestionFlowContainer', () => {
  it('should render questions for specified context', async () => {
    // Seed onboarding questions
    await seedQuestions('onboarding', [/* ... */]);

    const { getByText } = render(
      <QuestionFlowContainer
        context="onboarding"
        onComplete={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(getByText(/Qual é o seu nome?/)).toBeInTheDocument();
    });
  });

  it('should award coins when configured', async () => {
    const { getByTestId } = render(
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={jest.fn()}
      />
    );

    // Answer question
    const input = getByTestId('text-input');
    fireEvent.changeText(input, 'John');

    // Check coin counter incremented
    await waitFor(() => {
      expect(getByTestId('coin-counter')).toHaveTextContent('1');
    });
  });

  it('should not award coins when disabled', async () => {
    const { getByTestId } = render(
      <QuestionFlowContainer
        context="daily_checkin"
        coinRewardPerQuestion={0}
        onComplete={jest.fn()}
      />
    );

    // Coin counter should not be rendered
    expect(() => getByTestId('coin-counter')).toThrow();
  });

  it('should call onComplete when all questions answered', async () => {
    const onComplete = jest.fn();

    const { getByText, getByTestId } = render(
      <QuestionFlowContainer
        context="onboarding"
        onComplete={onComplete}
      />
    );

    // Answer all questions
    // ...

    // Click finish button
    fireEvent.press(getByText('✓ Concluir'));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });
});
```

### Integration Tests

```typescript
// app/onboarding.test.tsx
describe('Onboarding Integration', () => {
  it('should complete full onboarding flow', async () => {
    const { getByTestId, getByText } = render(<OnboardingScreen />);

    // Answer each question
    // ...

    // Complete onboarding
    fireEvent.press(getByText('✓ Concluir'));

    // Should navigate to tabs
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalledWith('/(tabs)/');
    });

    // Should mark onboarding as complete
    const status = await db.select().from(settings)
      .where(eq(settings.key, 'onboardingCompleted'))
      .get();
    expect(status.value).toBe('true');
  });
});
```

---

## Future Enhancements

### API Integration (Future)

When backend is ready, update repository layer:

```typescript
// db/repositories/questions.repository.ts
export function useQuestions(context: string) {
  return useQuery({
    queryKey: ['questions', context],
    queryFn: async () => {
      // Future: Fetch from API
      if (API_ENABLED) {
        const response = await fetch(`/api/questions?context=${context}`);
        return response.json();
      }

      // Current: Local database
      return await db
        .select()
        .from(questions)
        .where(eq(questions.context, context))
        .orderBy(questions.order)
        .all();
    },
  });
}
```

### Feature Flags (Future)

Add flow-specific configurations:

```typescript
export interface QuestionFlowProps {
  context: string;
  onComplete: () => void;
  coinRewardPerQuestion?: number;
  features?: {
    progressIndicator?: 'trail' | 'bar' | 'none';
    enableBackButton?: boolean;
    enableCoinAnimation?: boolean;
    animationStyle?: 'default' | 'minimal';
    idleButtonAnimation?: boolean;
  };
}
```

### Multi-Tenant Support (Future)

Add `userId` filtering:

```typescript
export function useQuestions(context: string, userId?: number) {
  return useQuery({
    queryKey: ['questions', context, userId],
    queryFn: async () => {
      let query = db.select().from(questions).where(eq(questions.context, context));

      if (userId) {
        // Filter questions assigned to user (future feature)
        query = query.where(eq(questions.assignedUserId, userId));
      }

      return query.orderBy(questions.order).all();
    },
  });
}
```

### Analytics (Future)

Track flow completion rates:

```typescript
// After onComplete callback
analytics.track('question_flow_completed', {
  context,
  questionsAnswered: answers.length,
  timeSpent: endTime - startTime,
  coinsEarned: coinRewardPerQuestion * answers.length,
});
```

---

## Implementation Checklist

### Phase 1: Database Schema
- [ ] Update `questions` schema - add `context` field
- [ ] Create `question-answers.ts` schema
- [ ] Update `coin-transactions` enum
- [ ] Generate migration (`npm run db:generate`)
- [ ] Convert `.sql` to `.ts` migration
- [ ] Write schema tests (`question-answers.test.ts`)

### Phase 2: Repository Layer
- [ ] Create `questions.repository.ts` with generic hooks
- [ ] Write repository tests (`questions.repository.test.ts`)
- [ ] Update `coin-transactions.repository.ts` - new metadata format
- [ ] Delete `onboarding.repository.ts`
- [ ] Update `index.ts` exports

### Phase 3: Utilities
- [ ] Rename `lib/onboarding-flow.ts` → `lib/question-flow.ts`
- [ ] Update tests (`question-flow.test.ts`)

### Phase 4: Components
- [ ] Rename folder `components/onboarding` → `components/question-flow`
- [ ] Rename `OnboardingContainer.tsx` → `QuestionFlowContainer.tsx`
- [ ] Update component to use generic hooks
- [ ] Add `context` and `coinRewardPerQuestion` props
- [ ] Write component tests
- [ ] Update all imports

### Phase 5: Seeding
- [ ] Update `onboardingQuestionsData` - add `context: 'onboarding'`
- [ ] Update `_layout.tsx` seed check

### Phase 6: Integration
- [ ] Update `/app/onboarding.tsx` to use `QuestionFlowContainer`
- [ ] Run full test suite - ensure 90% coverage
- [ ] Manual testing - iOS & Android

### Phase 7: Documentation
- [ ] Update `db/CLAUDE.md`
- [ ] Update `components/CLAUDE.md`
- [ ] Update `app/CLAUDE.md`
- [ ] Create this design doc ✅

---

## Success Criteria

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

## References

- **Original Onboarding Implementation:** `components/onboarding/OnboardingContainer.tsx`
- **Repository Pattern:** `db/CLAUDE.md`
- **Design System:** `components/CLAUDE.md`
- **Testing Requirements:** `/CLAUDE.md` (90% coverage)

---

## Questions & Decisions

**Q: Should we keep backward-compatible hooks like `useOnboardingQuestions()`?**
**A:** No. Breaking changes acceptable (no MVP yet). Clean slate preferred.

**Q: Should coin amount be stored in database?**
**A:** No. Caller defines reward amount. Keeps data model clean.

**Q: Should flows share questions?**
**A:** No. Separate questions per flow. Same `key` can exist in different contexts.

**Q: Should all flows award coins?**
**A:** No. Only flows with `coinRewardPerQuestion > 0` award coins.

**Q: API integration?**
**A:** Not now. Local database only. Design allows future API without breaking changes.

---

**End of Design Document**
