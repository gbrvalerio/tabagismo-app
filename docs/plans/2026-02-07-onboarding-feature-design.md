# Onboarding Feature Design

**Date:** 2026-02-07
**Status:** Approved
**Branch:** feat/onboarding

---

## Overview

Create a premium, animated onboarding flow where users answer medical questionnaire questions one at a time. The flow is dynamic (questions appear/skip based on dependencies), bidirectional (users can go back), and forced (cannot exit until complete). All questions are required, and progress is auto-saved for resume on app restart.

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Flow Logic** | Dynamic with dependencies | Show only relevant questions based on addiction type |
| **Data Storage** | Database-driven with schema-first | Questions in SQLite for flexibility, proper enums/types |
| **Navigation** | Bidirectional, forced completion | Users can correct mistakes but must complete onboarding |
| **Animation** | Premium multi-layer (slide + scale + fade + spring) | Create delightful, polished health/wellness experience |
| **Progress** | Percentage bar (dynamic) | Clear feedback even with variable question count |
| **Persistence** | Save immediately on each answer | Resume exactly where user left off |
| **UI Style** | Modern cards with premium feel | Large tappable cards, floating labels, visual distinction |
| **Validation** | All questions required | Ensure complete data for personalization |
| **Dependencies** | String keys (not IDs) | Maintainable, readable, stable across migrations |

---

## Database Schema

### `questions` Table

```typescript
export const questions = sqliteTable('questions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(), // e.g., "addiction_type", "cigarettes_per_day"
  order: integer('order').notNull(), // Display order
  type: text('type').notNull(), // 'TEXT' | 'NUMBER' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
  category: text('category').notNull(), // 'PROFILE' | 'ADDICTION' | 'HABITS' | 'MOTIVATION' | 'GOALS'
  questionText: text('question_text').notNull(), // Brazilian Portuguese
  required: integer('required', { mode: 'boolean' }).notNull().default(true),
  dependsOnQuestionKey: text('depends_on_question_key'), // Parent question key
  dependsOnValue: text('depends_on_value'), // Expected answer to show this question
  metadata: text('metadata', { mode: 'json' }), // Store choices array for selection questions
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

### `onboarding_answers` Table

```typescript
export const onboardingAnswers = sqliteTable('onboarding_answers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  questionKey: text('question_key').notNull(), // Foreign key to questions.key
  userId: integer('user_id'), // Future-proof for multi-user support
  answer: text('answer').notNull(), // Store any type as string/JSON
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

**Key Schema Decisions:**
- `key` column enables human-readable dependencies ("addiction_type" vs ID #6)
- `metadata` as JSON stores choices for selection-based questions
- Single `answer` column handles all types (arrays stored as JSON for multiple choice)
- `dependsOnQuestionKey` + `dependsOnValue` enables dynamic flow

---

## Question Flow Engine

### Dependency Resolution

```typescript
function computeApplicableQuestions(
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

### Example Dependency Chain

```
Q: "Qual é o seu vício?" (key: "addiction_type")
└─ A: "Cigarro/Tabaco"
    ├─ Shows: "Quantos cigarros por dia?" (dependsOnQuestionKey: "addiction_type", dependsOnValue: "Cigarro/Tabaco")
    ├─ Shows: "Quanto paga por carteira?" (dependsOnQuestionKey: "addiction_type", dependsOnValue: "Cigarro/Tabaco")
    └─ Hides: "Quantos dias dura um pod?" (dependsOnQuestionKey: "addiction_type", dependsOnValue: "Pod/Vape")
```

### Bidirectional Navigation Handling

**When user goes back and changes a parent question:**
1. Detect change in parent answer (e.g., "addiction_type" changes from "Cigarro" to "Pod")
2. Cascade delete dependent answers (delete all answers where question depends on changed key)
3. Recalculate applicable questions
4. If current position > last applicable question, jump to first unanswered

### Progress Calculation

```typescript
const progress = (answeredCount / applicableQuestionsCount) * 100;
```

- Dynamically adjusts as questions are shown/hidden
- Only counts applicable questions in denominator

### Resume Logic

```typescript
// On app launch:
1. Load existing answers from `onboarding_answers` table
2. Compute applicable questions based on answers
3. Find first unanswered question in applicable list
4. Navigate to that question
5. If all answered → mark onboarding complete, navigate to tabs
```

---

## Component Architecture

### File Structure

```
/app/onboarding.tsx (Modal screen, forced flow)
/components/onboarding/
  ├─ OnboardingContainer.tsx (state management, navigation)
  ├─ ProgressBar.tsx (percentage indicator)
  ├─ QuestionCard.tsx (animated card wrapper)
  ├─ QuestionText.tsx (large, readable text)
  └─ inputs/
      ├─ TextInput.tsx (floating label)
      ├─ NumberInput.tsx (numeric keyboard)
      ├─ SingleChoiceCards.tsx (tappable cards)
      └─ MultipleChoiceCards.tsx (multi-select cards)
/lib/onboarding-flow.ts (flow engine logic)
```

### Component Hierarchy

```
OnboardingScreen (modal, full-screen)
└─ OnboardingContainer
    ├─ ProgressBar (fixed top)
    ├─ Animated.View (QuestionCard wrapper)
    │   └─ QuestionCard
    │       ├─ QuestionText
    │       └─ QuestionInput (factory component)
    │           ├─ TextInput
    │           ├─ NumberInput
    │           ├─ SingleChoiceCards
    │           └─ MultipleChoiceCards
    └─ NavigationButtons (fixed bottom)
        ├─ BackButton (conditional)
        └─ NextButton (disabled until answered)
```

### Component Responsibilities

**OnboardingContainer:**
- Manages state (current question index, answers cache)
- Handles navigation forward/back
- Triggers save mutations
- Computes applicable questions and progress
- Handles completion and navigation to tabs

**QuestionCard:**
- Wraps question UI
- Handles Reanimated animations (slide, scale, fade, blur)
- Receives question data and answer handler

**QuestionInput Factory:**
- Renders appropriate input based on `question.type`
- Passes value and onChange handler to specific input components

**SingleChoiceCards/MultipleChoiceCards:**
- Modern card UI with icons, colors, tap feedback
- Haptic feedback on selection
- Animated checkmark on selection

---

## Animation System (Premium Feel)

### Multi-Layer Animations

```typescript
// Shared values:
const translateX = useSharedValue(0);
const scale = useSharedValue(1);
const opacity = useSharedValue(1);
const blur = useSharedValue(0);

const animateToQuestion = (direction: 'forward' | 'back') => {
  // Step 1: Animate OUT current question
  translateX.value = withTiming(
    direction === 'forward' ? -SCREEN_WIDTH : SCREEN_WIDTH,
    { duration: 300, easing: Easing.inOut(Easing.ease) }
  );
  scale.value = withTiming(0.9, { duration: 300 });
  opacity.value = withTiming(0, { duration: 250 });
  blur.value = withTiming(20, { duration: 300 });

  // Step 2: Update question data (runOnJS)
  runOnJS(updateCurrentQuestion)();

  // Step 3: Reset position for next question
  translateX.value = direction === 'forward'
    ? SCREEN_WIDTH * 0.3
    : -SCREEN_WIDTH * 0.3;
  scale.value = 0.95;
  opacity.value = 0;
  blur.value = 0;

  // Step 4: Animate IN next question (with spring physics!)
  translateX.value = withSpring(0, {
    damping: 20,
    stiffness: 90
  });
  scale.value = withSpring(1, { damping: 15 });
  opacity.value = withTiming(1, { duration: 400 });
};
```

### Staggered Content Reveal

**Question elements animate in sequence:**
1. Question text fades in (delay: 0ms)
2. Input cards slide up + fade in with stagger (delay: 100ms, +50ms per card)
3. Creates elegant cascade effect

### Interaction Feedback

**Card tap animation:**
```typescript
const cardScale = useSharedValue(1);

const handlePress = () => {
  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Scale down
  cardScale.value = withSequence(
    withTiming(0.97, { duration: 100 }),
    withSpring(1, { damping: 10 })
  );
};
```

**Answer selection feedback:**
- Checkmark icon scales in with rotation (0deg → 360deg)
- Card border color pulses (subtle glow effect)
- Success haptic feedback

**Progress bar animation:**
- Animated fill with spring physics
- Color shifts on milestones (25%, 50%, 75%, 100%)
- Subtle pulse effect when percentage increases

### Premium Touches

- **Parallax effect:** Background elements move slower than foreground (depth)
- **Card shadows:** Elevation increases on focus, animates smoothly
- **Completion celebration:** Confetti particles, success animation
- **Loading states:** Skeleton shimmer for initial load

---

## State Management & Caching

### OnboardingContainer State

```typescript
const [currentIndex, setCurrentIndex] = useState(0);
const [answersCache, setAnswersCache] = useState<Record<string, any>>({});
const [applicableQuestions, setApplicableQuestions] = useState<Question[]>([]);

// Queries
const { data: allQuestions } = useOnboardingQuestions();
const { data: existingAnswers } = useOnboardingAnswers();

// Mutations
const saveAnswerMutation = useSaveAnswer();
const completeOnboardingMutation = useCompleteOnboarding();
```

### Initialization (Resume Logic)

```typescript
useEffect(() => {
  if (!allQuestions || !existingAnswers) return;

  // Load existing answers into cache
  const cache = existingAnswers.reduce((acc, answer) => {
    acc[answer.questionKey] = JSON.parse(answer.answer);
    return acc;
  }, {} as Record<string, any>);

  setAnswersCache(cache);

  // Compute applicable questions based on existing answers
  const applicable = computeApplicableQuestions(allQuestions, cache);
  setApplicableQuestions(applicable);

  // Find first unanswered question
  const firstUnanswered = applicable.findIndex(q => !cache[q.key]);
  setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
}, [allQuestions, existingAnswers]);
```

### Answer Handler

```typescript
const handleAnswer = async (questionKey: string, value: any) => {
  // Update cache immediately (optimistic)
  const newCache = { ...answersCache, [questionKey]: value };
  setAnswersCache(newCache);

  // Save to database
  await saveAnswerMutation.mutateAsync({
    questionKey,
    answer: JSON.stringify(value),
  });

  // Recalculate applicable questions (dependencies might change)
  const newApplicable = computeApplicableQuestions(allQuestions, newCache);
  setApplicableQuestions(newApplicable);

  // Check if this was the last question
  if (currentIndex === newApplicable.length - 1) {
    // Mark onboarding complete
    await completeOnboardingMutation.mutateAsync();
    router.replace('/(tabs)');
  } else {
    // Auto-advance after short delay
    setTimeout(() => animateToQuestion('forward'), 400);
  }
};
```

### Dependency Cascade (Parent Answer Changed)

```typescript
const handleParentQuestionChange = (parentKey: string, newValue: any) => {
  // Find all questions that depend on this parent
  const dependentQuestions = allQuestions.filter(
    q => q.dependsOnQuestionKey === parentKey
  );

  // Delete answers for dependent questions
  const newCache = { ...answersCache };
  dependentQuestions.forEach(q => {
    delete newCache[q.key];
  });

  setAnswersCache(newCache);

  // Recalculate applicable questions
  const newApplicable = computeApplicableQuestions(allQuestions, newCache);
  setApplicableQuestions(newApplicable);

  // Adjust current index if needed
  if (currentIndex >= newApplicable.length) {
    setCurrentIndex(newApplicable.length - 1);
  }
};
```

---

## Repository Hooks

### Queries

```typescript
// Get all questions (ordered)
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

// Get user's answers
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

### Mutations

```typescript
// Save/update answer
export function useSaveAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      questionKey,
      answer
    }: {
      questionKey: string;
      answer: string;
    }) => {
      // Check if answer exists
      const existing = await db
        .select()
        .from(onboardingAnswers)
        .where(eq(onboardingAnswers.questionKey, questionKey))
        .get();

      if (existing) {
        // Update
        return await db
          .update(onboardingAnswers)
          .set({
            answer,
            updatedAt: new Date()
          })
          .where(eq(onboardingAnswers.questionKey, questionKey))
          .returning();
      } else {
        // Insert
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

---

## Initial Data Seeding

### Seed CSV Format

**File:** `/assets/data/onboarding-questions.csv`

**Columns:**
- `key` - Human-readable key (e.g., "name", "addiction_type")
- `order` - Display order (integer)
- `type` - Question type enum
- `category` - Category enum
- `questionText` - Brazilian Portuguese question
- `dependsOnQuestionKey` - Parent question key (or empty)
- `dependsOnValue` - Expected parent answer (or empty)
- `metadata` - JSON string with choices array

**Example rows:**
```csv
key,order,type,category,questionText,dependsOnQuestionKey,dependsOnValue,metadata
name,1,TEXT,PROFILE,"Qual é o seu nome?",,,"{}"
gender,2,SINGLE_CHOICE,PROFILE,"Qual é o seu gênero?",,,"{""choices"":[""Masculino"",""Feminino"",""Outro""]}"
addiction_type,4,SINGLE_CHOICE,ADDICTION,"Qual é o seu vício?",,,"{""choices"":[""Cigarro/Tabaco"",""Pod/Vape""]}"
cigarettes_per_day,5,NUMBER,HABITS,"Quantos cigarros por dia?",addiction_type,"Cigarro/Tabaco","{}"
pod_duration_days,6,NUMBER,HABITS,"Quantos dias dura um pod?",addiction_type,"Pod/Vape","{}"
```

### Seed Script

```typescript
// /db/seed/seed-questions.ts
import * as FileSystem from 'expo-file-system';
import { db } from '../client';
import { questions } from '../schema';
import Papa from 'papaparse';

export async function seedOnboardingQuestions() {
  const csvPath = `${FileSystem.documentDirectory}assets/data/onboarding-questions.csv`;
  const csvContent = await FileSystem.readAsStringAsync(csvPath);

  const { data: rows } = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  // Clear existing questions (dev only)
  await db.delete(questions).execute();

  // Insert all questions
  const questionData = rows.map((row: any) => ({
    key: row.key,
    order: parseInt(row.order),
    type: row.type,
    category: row.category,
    questionText: row.questionText,
    dependsOnQuestionKey: row.dependsOnQuestionKey || null,
    dependsOnValue: row.dependsOnValue || null,
    required: true,
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
  }));

  await db.insert(questions).values(questionData);

  console.log(`[SEED] Inserted ${questionData.length} questions`);
}
```

### When to Seed

**Option A (Recommended):** Check on app launch, auto-seed if empty
```typescript
// In /app/_layout.tsx after migrations
const { data: existingQuestions } = await db.select().from(questions).all();
if (existingQuestions.length === 0) {
  await seedOnboardingQuestions();
}
```

**Option B:** Manual seed via Expo dev menu command

---

## Testing Strategy (TDD - 90% Coverage Required)

### Database Layer Tests

**File:** `/db/repositories/onboarding.repository.test.ts`

```typescript
describe('useOnboardingQuestions', () => {
  it('returns all questions ordered by order field', async () => {
    // Seed test questions
    // Query with hook
    // Assert order and count
  });
});

describe('computeApplicableQuestions', () => {
  it('shows cigarette questions when addiction_type is Cigarro', () => {
    const answers = { addiction_type: 'Cigarro/Tabaco' };
    const applicable = computeApplicableQuestions(allQuestions, answers);

    expect(applicable.find(q => q.key === 'cigarettes_per_day')).toBeDefined();
    expect(applicable.find(q => q.key === 'pod_duration_days')).toBeUndefined();
  });

  it('shows pod questions when addiction_type is Pod', () => {
    const answers = { addiction_type: 'Pod/Vape' };
    const applicable = computeApplicableQuestions(allQuestions, answers);

    expect(applicable.find(q => q.key === 'pod_duration_days')).toBeDefined();
    expect(applicable.find(q => q.key === 'cigarettes_per_day')).toBeUndefined();
  });

  it('cascades dependencies correctly', () => {
    // Test multi-level dependencies
  });
});

describe('useSaveAnswer', () => {
  it('inserts new answer if not exists', async () => {
    // Call mutation
    // Assert inserted
  });

  it('updates existing answer if exists', async () => {
    // Insert initial answer
    // Update with mutation
    // Assert updated
  });

  it('invalidates queries on success', async () => {
    // Mock queryClient
    // Call mutation
    // Assert invalidateQueries called
  });
});
```

### Component Tests

**File:** `/app/onboarding.test.tsx`

```typescript
describe('OnboardingScreen', () => {
  it('renders first question on mount', async () => {
    render(<OnboardingScreen />);
    expect(screen.getByText(/Qual é o seu nome?/i)).toBeDefined();
  });

  it('shows progress bar with correct percentage', async () => {
    render(<OnboardingScreen />);
    // Answer first question
    // Assert progress bar shows ~5% (1/20 questions)
  });

  it('advances to next question after answering', async () => {
    render(<OnboardingScreen />);
    const input = screen.getByPlaceholderText('Nome');
    fireEvent.changeText(input, 'João');
    fireEvent.press(screen.getByText('Próxima'));

    await waitFor(() => {
      expect(screen.getByText(/Qual é o seu gênero?/i)).toBeDefined();
    });
  });

  it('navigates back to previous question', async () => {
    // Answer first question
    // Click back button
    // Assert first question shown again
  });

  it('saves answer immediately on selection', async () => {
    // Mock mutation
    // Select answer
    // Assert mutation called with correct data
  });

  it('resumes at correct question on app restart', async () => {
    // Seed existing answers for first 3 questions
    // Mount component
    // Assert currentIndex is 3
  });

  it('completes onboarding when all questions answered', async () => {
    // Answer all questions
    // Assert completeOnboarding called
    // Assert navigation to tabs
  });

  it('deletes dependent answers when parent changes', async () => {
    // Answer addiction_type = 'Cigarro'
    // Answer cigarettes_per_day = 20
    // Go back and change addiction_type to 'Pod'
    // Assert cigarettes_per_day answer deleted
  });
});
```

### Flow Logic Tests

**File:** `/lib/onboarding-flow.test.ts`

```typescript
describe('Dependency Resolution', () => {
  it('filters questions based on simple dependency', () => {
    // Test single-level dependency
  });

  it('handles multi-level dependencies', () => {
    // Test cascade dependencies
  });

  it('handles missing parent answers', () => {
    // If parent not answered, dependent should not show
  });
});

describe('Progress Calculation', () => {
  it('calculates percentage based on applicable questions', () => {
    // 5 answered, 10 applicable total = 50%
  });

  it('adjusts progress when questions are skipped', () => {
    // Change answer that hides 5 questions
    // Progress should recalculate
  });
});
```

### TDD Workflow

1. **Red Phase:** Write failing test for repository hook
2. **Green Phase:** Implement hook to pass test
3. **Refactor Phase:** Optimize queries, improve code quality
4. **Repeat:** Move to next feature

**Note:** Use `--no-verify` flag during red phase to commit failing tests (per CLAUDE.md guidance).

---

## UI Component Details

### SingleChoiceCards

**Design:**
- Large tappable cards (full width, ~80px height)
- Icon on left (optional, based on question type)
- Text centered
- Selected state: filled background, checkmark, border glow
- Unselected state: outline border, transparent background

**Animation:**
- Stagger entrance (each card delays +50ms)
- Tap: scale down to 0.97, spring back
- Select: checkmark rotates in (0deg → 360deg), background fills

### MultipleChoiceCards

**Similar to SingleChoiceCards but:**
- Can select multiple
- Checkmark toggles on/off
- Selected cards stack visually (subtle elevation increase)

### TextInput / NumberInput

**Design:**
- Floating label design
- Underline border (animates to full on focus)
- Large, readable font size (18px)
- NumberInput: numeric keyboard type

**Validation feedback:**
- Red underline for errors
- Green checkmark on valid input
- Subtle shake animation on validation error

---

## Routing & Navigation

### Onboarding Screen Route

**File:** `/app/onboarding.tsx`

**Presentation:** Modal, full-screen, no header

**Registration in `/app/_layout.tsx`:**
```typescript
<Stack.Screen
  name="onboarding"
  options={{
    presentation: 'modal',
    headerShown: false,
    gestureEnabled: false, // Prevent swipe to dismiss
  }}
/>
```

### Navigation Flow

1. **App launch:** Check `onboarding_completed` in settings
2. **If false:** Navigate to `/onboarding`
3. **On complete:** Mark setting true, navigate to `/(tabs)`
4. **Cannot exit:** No close button, no swipe to dismiss

### Root Layout Check

```typescript
// In /app/_layout.tsx after migrations
const { data: onboardingCompleted } = useOnboardingStatus();

useEffect(() => {
  if (onboardingCompleted === false) {
    router.replace('/onboarding');
  }
}, [onboardingCompleted]);
```

---

## Implementation Phases

### Phase 1: Database & Schema
- [ ] Create questions schema with enums
- [ ] Create onboarding_answers schema
- [ ] Generate and convert migrations
- [ ] Create repository hooks (queries + mutations)
- [ ] Write repository tests (TDD)

### Phase 2: Flow Engine
- [ ] Implement `computeApplicableQuestions` logic
- [ ] Implement dependency cascade logic
- [ ] Write flow engine tests (TDD)
- [ ] Implement progress calculation

### Phase 3: UI Components
- [ ] Create QuestionText component
- [ ] Create TextInput component
- [ ] Create NumberInput component
- [ ] Create SingleChoiceCards component
- [ ] Create MultipleChoiceCards component
- [ ] Write component tests (TDD)

### Phase 4: Onboarding Container
- [ ] Implement state management
- [ ] Implement answer caching
- [ ] Implement resume logic
- [ ] Connect repository hooks
- [ ] Write container tests (TDD)

### Phase 5: Animations
- [ ] Implement slide + scale + fade animations
- [ ] Implement staggered content reveal
- [ ] Implement interaction feedback (tap, select)
- [ ] Implement progress bar animation
- [ ] Add premium touches (parallax, shadows, confetti)

### Phase 6: Data Seeding
- [ ] Create seed CSV from original questionnaire (Task #1)
- [ ] Implement seed script
- [ ] Test seeding on fresh install
- [ ] Document seeding process

### Phase 7: Integration
- [ ] Add onboarding route to app
- [ ] Add navigation logic in root layout
- [ ] Test complete flow end-to-end
- [ ] Test resume after app restart
- [ ] Test dependency cascades
- [ ] Achieve 90% test coverage

---

## Success Criteria

- ✅ User completes questionnaire with dynamic flow (questions appear/skip based on answers)
- ✅ Premium animations create delightful experience (slide, scale, fade, spring)
- ✅ Bidirectional navigation works correctly (can go back, dependent answers cascade delete)
- ✅ Progress bar reflects dynamic question count accurately
- ✅ Answers saved immediately, resume on app restart
- ✅ All questions required, no skipping
- ✅ 90% test coverage achieved
- ✅ TDD approach followed throughout
- ✅ Clean, maintainable code with proper enums and types

---

## Future Enhancements

- **Versioning:** Track questionnaire version, allow re-answering for updates
- **Analytics:** Track completion rate, drop-off points, time per question
- **A/B Testing:** Test different question orders, phrasings
- **Localization:** Support multiple languages (currently pt-BR only)
- **Skip logic:** Allow certain questions to be optional based on user preferences
- **Conditional validation:** Different validation rules based on question context
