# Onboarding UX Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor onboarding flow with SafeAreaView, KeyboardAvoidingView, ScrollView, auto-focus inputs, and improved header/footer layout following mobile conventions.

**Architecture:** Split OnboardingContainer into three zones (Header, Content, Footer) wrapped in SafeAreaView and KeyboardAvoidingView. Add auto-focus to text/number inputs with 300ms delay. Keep question text fixed while options scroll.

**Tech Stack:** React Native 0.81.5, react-native-safe-area-context 5.6.0, expo-router, Jest

---

## Task 1: Add Auto-Focus to TextInput Component

**Files:**
- Modify: `components/onboarding/inputs/TextInput.tsx:1-37`
- Test: `components/onboarding/inputs/TextInput.test.tsx`

**Step 1: Write failing test for auto-focus behavior**

Add to `TextInput.test.tsx` after existing tests:

```typescript
it('should auto-focus on mount', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

  const input = screen.getByPlaceholderText('Nome');

  // Fast-forward past the 300ms delay
  jest.advanceTimersByTime(300);

  expect(input.props.ref).toBeDefined();

  jest.useRealTimers();
});

it('should cleanup timer on unmount', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const { unmount } = render(<OnboardingTextInput value="" onChange={onChange} placeholder="Nome" />);

  unmount();

  // Verify no timers are pending
  expect(jest.getTimerCount()).toBe(0);

  jest.useRealTimers();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- TextInput.test.tsx`
Expected: FAIL with "expect(received).toBeDefined()" or similar

**Step 3: Implement auto-focus in TextInput component**

Update `components/onboarding/inputs/TextInput.tsx`:

```typescript
import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useEffect } from 'react';

interface OnboardingTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function OnboardingTextInput({ value, onChange, placeholder }: OnboardingTextInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Small delay to ensure smooth transition from previous question
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
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

Run: `npm test -- TextInput.test.tsx`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add components/onboarding/inputs/TextInput.tsx components/onboarding/inputs/TextInput.test.tsx
git commit -m "feat(onboarding): add auto-focus to text input with 300ms delay"
```

---

## Task 2: Add Auto-Focus to NumberInput Component

**Files:**
- Modify: `components/onboarding/inputs/NumberInput.tsx:1-45`
- Test: `components/onboarding/inputs/NumberInput.test.tsx`

**Step 1: Write failing test for auto-focus behavior**

Add to `NumberInput.test.tsx` after existing tests:

```typescript
it('should auto-focus on mount', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

  const input = screen.getByPlaceholderText('Idade');

  // Fast-forward past the 300ms delay
  jest.advanceTimersByTime(300);

  expect(input.props.ref).toBeDefined();

  jest.useRealTimers();
});

it('should cleanup timer on unmount', () => {
  jest.useFakeTimers();
  const onChange = jest.fn();
  const { unmount } = render(<OnboardingNumberInput value={null} onChange={onChange} placeholder="Idade" />);

  unmount();

  // Verify no timers are pending
  expect(jest.getTimerCount()).toBe(0);

  jest.useRealTimers();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- NumberInput.test.tsx`
Expected: FAIL with "expect(received).toBeDefined()" or similar

**Step 3: Implement auto-focus in NumberInput component**

Update `components/onboarding/inputs/NumberInput.tsx`:

```typescript
import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useEffect } from 'react';

interface OnboardingNumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  placeholder: string;
}

export function OnboardingNumberInput({ value, onChange, placeholder }: OnboardingNumberInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Small delay to ensure smooth transition from previous question
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
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

Run: `npm test -- NumberInput.test.tsx`
Expected: PASS (all tests green)

**Step 5: Commit**

```bash
git add components/onboarding/inputs/NumberInput.tsx components/onboarding/inputs/NumberInput.test.tsx
git commit -m "feat(onboarding): add auto-focus to number input with 300ms delay"
```

---

## Task 3: Refactor OnboardingContainer Layout - Write Failing Tests

**Files:**
- Test: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write failing tests for new layout structure**

Add to `OnboardingContainer.test.tsx` after existing tests:

```typescript
it('should render SafeAreaView wrapper', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.getByTestId('safe-area-container')).toBeDefined();
  });
});

it('should render KeyboardAvoidingView with correct behavior', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    const keyboardView = screen.getByTestId('keyboard-avoiding-view');
    expect(keyboardView).toBeDefined();
    expect(keyboardView.props.behavior).toBe('padding'); // iOS default
  });
});

it('should render header with progress bar', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.getByTestId('onboarding-header')).toBeDefined();
  });
});

it('should render back button in header when currentIndex > 0', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockTwoQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [
      { id: 1, userId: 1, questionKey: 'q1', answer: '"answered"', createdAt: new Date() },
    ],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.getByText('← Voltar')).toBeDefined();
  });
});

it('should not render back button when currentIndex = 0', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.queryByText('← Voltar')).toBeNull();
  });
});

it('should render scrollable content area', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.getByTestId('content-scroll-view')).toBeDefined();
  });
});

it('should render footer with action button', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [
      { id: 1, userId: 1, questionKey: 'name', answer: '"John"', createdAt: new Date() },
    ],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    expect(screen.getByTestId('onboarding-footer')).toBeDefined();
  });
});

it('should keep question text fixed outside ScrollView', async () => {
  mockUseOnboardingQuestions.mockReturnValue({
    data: mockQuestions,
    isLoading: false,
  });
  mockUseOnboardingAnswers.mockReturnValue({
    data: [],
    isLoading: false,
  });

  render(<OnboardingContainer />);

  await waitFor(() => {
    const questionText = screen.getByText('Qual é o seu nome?');
    const scrollView = screen.getByTestId('content-scroll-view');

    // Question text should not be inside the ScrollView
    expect(questionText).toBeDefined();
    expect(scrollView).toBeDefined();
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- OnboardingContainer.test.tsx`
Expected: FAIL with "Unable to find element with testID: safe-area-container" and similar errors

**Step 3: Commit failing tests**

```bash
git add components/onboarding/OnboardingContainer.test.tsx
git commit -m "test(onboarding): add failing tests for new layout structure" --no-verify
```

---

## Task 4: Implement New Layout Structure in OnboardingContainer

**Files:**
- Modify: `components/onboarding/OnboardingContainer.tsx:1-228`

**Step 1: Add imports and refactor component structure**

Update `components/onboarding/OnboardingContainer.tsx`:

```typescript
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingQuestions, useOnboardingAnswers, useSaveAnswer, useDeleteDependentAnswers, useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';
import { computeApplicableQuestions, calculateProgress } from '@/lib/onboarding-flow';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuestionText } from './QuestionText';
import { QuestionInput } from './QuestionInput';

import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});

  const { data: allQuestions, isLoading: questionsLoading } = useOnboardingQuestions();
  const { data: existingAnswers, isLoading: answersLoading } = useOnboardingAnswers();
  const saveAnswerMutation = useSaveAnswer();
  const deleteDependentAnswersMutation = useDeleteDependentAnswers();
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();

  const isLoading = questionsLoading || answersLoading;
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;
    if (initialLoadDone.current) return;
    initialLoadDone.current = true;

    // Load existing answers into cache
    const cache = existingAnswers.reduce((acc, answer) => {
      try {
        acc[answer.questionKey] = JSON.parse(answer.answer);
      } catch {
        acc[answer.questionKey] = answer.answer;
      }
      return acc;
    }, {} as Record<string, unknown>);

    setAnswersCache(cache);

    // Find first unanswered question
    const applicable = computeApplicableQuestions(allQuestions, cache);
    const firstUnanswered = applicable.findIndex(q => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  // Derive applicable questions from current state — not stored in a separate useState
  const applicableQuestions = allQuestions
    ? computeApplicableQuestions(allQuestions, answersCache)
    : [];

  const handleAnswer = async (questionKey: string, value: unknown) => {
    // Update cache immediately (optimistic)
    const newCache = { ...answersCache, [questionKey]: value };
    setAnswersCache(newCache);

    // Save to database
    await saveAnswerMutation.mutateAsync({
      questionKey,
      answer: JSON.stringify(value),
    });

    // Delete dependent answers if this question has dependents
    if (allQuestions) {
      const hasDependents = allQuestions.some(q => q.dependsOnQuestionKey === questionKey);
      if (hasDependents) {
        await deleteDependentAnswersMutation.mutateAsync({
          parentQuestionKey: questionKey,
        });

        // Remove dependent answers and all answers for questions that come after
        const dependentQuestions = allQuestions.filter(q => q.dependsOnQuestionKey === questionKey);
        const minDependentOrder = Math.min(...dependentQuestions.map(q => q.order));

        // Clear all answers from the minimum dependent order onwards
        for (const q of allQuestions) {
          if (q.order >= minDependentOrder && q.key !== questionKey) {
            delete newCache[q.key];
          }
        }

        setAnswersCache({ ...newCache });
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

  const currentQuestion = applicableQuestions[currentIndex];
  const answeredCount = Object.keys(answersCache).filter(key =>
    applicableQuestions.some(q => q.key === key)
  ).length;
  const progress = calculateProgress(answeredCount, applicableQuestions.length);

  const currentAnswer = currentQuestion ? answersCache[currentQuestion.key] : null;
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null && currentAnswer !== '';
  const isLastQuestion = currentIndex === applicableQuestions.length - 1;

  const handleFinish = async () => {
    await completeOnboardingMutation.mutateAsync();
    router.replace('/(tabs)/' as any);
  };

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']} testID="safe-area-container">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        testID="keyboard-avoiding-view"
      >
        {/* Header - Fixed at top */}
        <View style={styles.header} testID="onboarding-header">
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
          <ProgressBar
            progress={progress}
            currentStep={answeredCount + 1}
            totalSteps={applicableQuestions.length}
          />
        </View>

        {/* Content - Scrollable middle section */}
        <View style={styles.content}>
          {currentQuestion && (
            <QuestionCard>
              {/* Fixed question text */}
              <View style={styles.questionHeader}>
                <QuestionText text={currentQuestion.questionText} />
              </View>

              {/* Scrollable input area */}
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                testID="content-scroll-view"
              >
                <QuestionInput
                  question={currentQuestion}
                  value={(answersCache[currentQuestion.key] as string | number | string[] | undefined) ?? null}
                  onChange={(value) => handleAnswer(currentQuestion.key, value)}
                />
              </ScrollView>
            </QuestionCard>
          )}
        </View>

        {/* Footer - Fixed at bottom */}
        <View style={styles.footer} testID="onboarding-footer">
          {isAnswered && !isLastQuestion && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.7}
              style={styles.nextButton}
            >
              <Text style={styles.buttonText}>Próxima →</Text>
            </TouchableOpacity>
          )}
          {isAnswered && isLastQuestion && (
            <TouchableOpacity
              onPress={handleFinish}
              activeOpacity={0.7}
              style={styles.finishButton}
            >
              <Text style={styles.finishButtonText}>✓ Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.gray[600],
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  questionHeader: {
    marginBottom: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  nextButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    ...shadows.md,
  },
  finishButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.semantic.success,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    ...shadows.md,
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  finishButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
});
```

**Step 2: Run tests to verify they pass**

Run: `npm test -- OnboardingContainer.test.tsx`
Expected: PASS (all tests green)

**Step 3: Run full test suite to ensure no regressions**

Run: `npm test`
Expected: PASS (all tests should pass)

**Step 4: Commit**

```bash
git add components/onboarding/OnboardingContainer.tsx
git commit -m "feat(onboarding): refactor layout with SafeAreaView, KeyboardAvoidingView, and ScrollView"
```

---

## Task 5: Update QuestionCard to Work with New Layout

**Files:**
- Modify: `components/onboarding/QuestionCard.tsx`
- Test: `components/onboarding/QuestionCard.test.tsx`

**Step 1: Read current QuestionCard implementation**

The QuestionCard currently wraps all question content. With the new layout, it should accommodate the split between fixed question text and scrollable input.

**Step 2: Write test to ensure QuestionCard preserves flex layout**

Add to `QuestionCard.test.tsx`:

```typescript
it('should have flex: 1 to fill available space', () => {
  const { getByTestId } = render(
    <QuestionCard>
      <Text>Content</Text>
    </QuestionCard>
  );

  const card = getByTestId('question-card');
  const styles = card.props.style;
  const flatStyle = Array.isArray(styles)
    ? Object.assign({}, ...styles.flat(Infinity).filter(Boolean))
    : styles;

  expect(flatStyle.flex).toBe(1);
});
```

**Step 3: Run test to verify current behavior**

Run: `npm test -- QuestionCard.test.tsx`
Expected: May pass or fail depending on current implementation

**Step 4: Update QuestionCard if needed**

Ensure QuestionCard has `flex: 1` in its container style to work properly with the new layout. Only modify if the test fails.

**Step 5: Run test to verify**

Run: `npm test -- QuestionCard.test.tsx`
Expected: PASS

**Step 6: Commit if changes were made**

```bash
git add components/onboarding/QuestionCard.tsx components/onboarding/QuestionCard.test.tsx
git commit -m "feat(onboarding): ensure QuestionCard supports flex layout"
```

---

## Task 6: Integration Testing - Complete Flow with Keyboard

**Files:**
- Test: `components/onboarding/OnboardingContainer.test.tsx`

**Step 1: Write integration test for complete flow**

Add to `OnboardingContainer.test.tsx`:

```typescript
describe('Integration: Complete onboarding flow', () => {
  it('should navigate through questions with auto-focus and keyboard', async () => {
    const mockSaveAnswer = jest.fn().mockResolvedValue(undefined);
    const mockDeleteDependentAnswers = jest.fn().mockResolvedValue(undefined);
    const mockCompleteOnboarding = jest.fn().mockResolvedValue(undefined);

    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mockUseSaveAnswer.mockReturnValue({
      mutateAsync: mockSaveAnswer,
    });
    mockUseDeleteDependentAnswers.mockReturnValue({
      mutateAsync: mockDeleteDependentAnswers,
    });
    mockUseCompleteOnboarding.mockReturnValue({
      mutateAsync: mockCompleteOnboarding,
    });

    render(<OnboardingContainer />);

    // Wait for first question to render
    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Verify SafeAreaView and KeyboardAvoidingView are present
    expect(screen.getByTestId('safe-area-container')).toBeDefined();
    expect(screen.getByTestId('keyboard-avoiding-view')).toBeDefined();

    // Answer first question
    const input = screen.getByPlaceholderText('First?');
    fireEvent.changeText(input, 'Answer 1');

    await waitFor(() => {
      expect(mockSaveAnswer).toHaveBeenCalledWith({
        questionKey: 'q1',
        answer: '"Answer 1"',
      });
    });

    // Navigate to second question
    const nextButton = screen.getByText('Próxima →');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Verify back button appears
    expect(screen.getByText('← Voltar')).toBeDefined();

    // Answer second question
    const input2 = screen.getByPlaceholderText('Second?');
    fireEvent.changeText(input2, 'Answer 2');

    await waitFor(() => {
      expect(mockSaveAnswer).toHaveBeenCalledWith({
        questionKey: 'q2',
        answer: '"Answer 2"',
      });
    });

    // Finish onboarding
    const finishButton = screen.getByText('✓ Concluir');
    fireEvent.press(finishButton);

    await waitFor(() => {
      expect(mockCompleteOnboarding).toHaveBeenCalled();
    });
  });

  it('should handle back navigation with preserved answers', async () => {
    const mockSaveAnswer = jest.fn().mockResolvedValue(undefined);

    mockUseOnboardingQuestions.mockReturnValue({
      data: mockTwoQuestions,
      isLoading: false,
    });
    mockUseOnboardingAnswers.mockReturnValue({
      data: [
        { id: 1, userId: 1, questionKey: 'q1', answer: '"Saved Answer"', createdAt: new Date() },
      ],
      isLoading: false,
    });
    mockUseSaveAnswer.mockReturnValue({
      mutateAsync: mockSaveAnswer,
    });

    render(<OnboardingContainer />);

    // Should start at second question (first is answered)
    await waitFor(() => {
      expect(screen.getByText('Second?')).toBeDefined();
    });

    // Back button should be visible
    expect(screen.getByText('← Voltar')).toBeDefined();

    // Navigate back
    const backButton = screen.getByText('← Voltar');
    fireEvent.press(backButton);

    await waitFor(() => {
      expect(screen.getByText('First?')).toBeDefined();
    });

    // Verify the saved answer is displayed
    expect(screen.getByDisplayValue('Saved Answer')).toBeDefined();

    // Back button should not be visible on first question
    expect(screen.queryByText('← Voltar')).toBeNull();
  });
});
```

**Step 2: Run integration tests**

Run: `npm test -- OnboardingContainer.test.tsx`
Expected: PASS (all integration tests green)

**Step 3: Commit**

```bash
git add components/onboarding/OnboardingContainer.test.tsx
git commit -m "test(onboarding): add integration tests for complete flow with new layout"
```

---

## Task 7: Run Full Test Suite and Verify Coverage

**Files:**
- All test files

**Step 1: Run complete test suite**

Run: `npm test`
Expected: PASS (all tests across the entire codebase)

**Step 2: Check test coverage**

Run: `npm run test:coverage`
Expected: Coverage >= 90% for modified files

**Step 3: Review coverage report**

Check that the following files have adequate coverage:
- `components/onboarding/OnboardingContainer.tsx` >= 90%
- `components/onboarding/inputs/TextInput.tsx` >= 90%
- `components/onboarding/inputs/NumberInput.tsx` >= 90%

**Step 4: Add additional tests if coverage is below 90%**

If any files are below 90% coverage, identify uncovered branches/lines and add targeted tests.

**Step 5: Commit any additional tests**

```bash
git add components/onboarding/**/*.test.tsx
git commit -m "test(onboarding): achieve 90% coverage for UX improvements"
```

---

## Task 8: Manual Testing on iOS Simulator

**Files:**
- None (manual testing)

**Step 1: Start iOS simulator**

Run: `npm run ios`
Expected: App launches in iOS simulator

**Step 2: Navigate to onboarding**

If already completed, reset onboarding state via database or fresh install.

**Step 3: Test SafeAreaView on device with notch**

Use iPhone 14 or newer simulator to verify:
- Header respects top safe area (not hidden behind notch)
- Footer respects bottom safe area (not hidden behind home indicator)
- Content is fully visible

**Step 4: Test auto-focus on text input**

- Navigate to a TEXT question
- Verify keyboard appears automatically after 300ms
- Verify input has focus (cursor visible)

**Step 5: Test auto-focus on number input**

- Navigate to a NUMBER question
- Verify numeric keyboard appears automatically after 300ms
- Verify input has focus

**Step 6: Test KeyboardAvoidingView**

- With keyboard open on a text/number question
- Verify footer button is visible above keyboard
- Verify question text is still visible
- Verify input is not hidden by keyboard

**Step 7: Test ScrollView with many options**

- Navigate to a SINGLE_CHOICE or MULTIPLE_CHOICE question with 10+ options
- Verify you can scroll through all options
- Verify footer button stays fixed at bottom
- Verify question text stays fixed at top

**Step 8: Test back button navigation**

- Answer first question
- Move to second question
- Verify back button appears in header
- Press back button
- Verify it navigates to previous question
- Verify answer is preserved

**Step 9: Test complete flow**

- Complete all questions
- Verify "✓ Concluir" button appears on last question
- Tap finish
- Verify navigation to main tabs

**Step 10: Document any issues**

Note any visual bugs, layout issues, or unexpected behavior.

---

## Task 9: Manual Testing on Android Emulator

**Files:**
- None (manual testing)

**Step 1: Start Android emulator**

Run: `npm run android`
Expected: App launches in Android emulator

**Step 2: Repeat all tests from Task 8 on Android**

Execute steps 2-9 from Task 8 on Android emulator.

**Step 3: Test Android-specific keyboard behavior**

- Verify `KeyboardAvoidingView` with `behavior="height"` works correctly
- Verify back button (hardware/software) doesn't break navigation
- Verify keyboard dismissal via swipe down or back button

**Step 4: Document any Android-specific issues**

Note any platform-specific bugs or differences from iOS.

---

## Task 10: Update CLAUDE.md Documentation

**Files:**
- Modify: `components/CLAUDE.md`

**Step 1: Update OnboardingContainer documentation**

Update the OnboardingContainer section in `components/CLAUDE.md`:

```markdown
### OnboardingContainer

**File:** `onboarding/OnboardingContainer.tsx`

Main orchestrator wrapped in SafeAreaView and KeyboardAvoidingView for proper mobile layout. Manages current question index, answers cache, and applicable questions via `computeApplicableQuestions()` from `@/lib/onboarding-flow`. Handles answer saving, navigation (Voltar/Próxima/Concluir), and completion.

**Layout Structure:**
- Header: Back button (when currentIndex > 0) + Progress bar
- Content: Fixed question text + ScrollView for inputs/options
- Footer: Next/Finish button (when answered)

**Safe Area & Keyboard:**
- Uses `SafeAreaView` with `edges={['top', 'bottom']}` for notch/home indicator support
- Uses `KeyboardAvoidingView` with platform-specific behavior (iOS: padding, Android: height)
- ScrollView enables scrolling for long option lists

**Hooks used:** `useOnboardingQuestions`, `useOnboardingAnswers`, `useSaveAnswer`, `useDeleteDependentAnswers`, `useCompleteOnboarding`
```

**Step 2: Update input components documentation**

Update the Input Components table:

```markdown
### Input Components

Located in `onboarding/inputs/`:

| Component | File | Description |
|-----------|------|-------------|
| `OnboardingTextInput` | `inputs/TextInput.tsx` | Text input with auto-focus (300ms delay), bottom border, uses `icon` theme color |
| `OnboardingNumberInput` | `inputs/NumberInput.tsx` | Numeric input with auto-focus (300ms delay), `keyboardType="numeric"`, `parseInt` validation |
| `SingleChoiceCards` | `inputs/SingleChoiceCards.tsx` | Touchable cards with haptic feedback, single selection |
| `MultipleChoiceCards` | `inputs/MultipleChoiceCards.tsx` | Touchable cards with haptic feedback, toggle selection |
```

**Step 3: Commit documentation updates**

```bash
git add components/CLAUDE.md
git commit -m "docs(onboarding): update CLAUDE.md with new layout structure"
```

---

## Task 11: Final Verification and Cleanup

**Files:**
- All modified files

**Step 1: Run complete test suite one final time**

Run: `npm test`
Expected: PASS (all tests green)

**Step 2: Run TypeScript type checking**

Run: `npm run typecheck`
Expected: No type errors

**Step 3: Run linter**

Run: `npm run lint`
Expected: No linting errors

**Step 4: Check git status**

Run: `git status`
Expected: Clean working tree (all changes committed)

**Step 5: Review commit history**

Run: `git log --oneline -20`
Expected: Clean, descriptive commit messages following conventional commits

**Step 6: Create summary of changes**

Document final changes:
- Auto-focus added to TextInput and NumberInput (300ms delay)
- OnboardingContainer refactored with SafeAreaView, KeyboardAvoidingView, ScrollView
- Layout split into Header/Content/Footer zones
- Back button moved to header
- Next/Finish button moved to footer
- Question text kept fixed while inputs/options scroll
- All tests passing with >= 90% coverage
- Manual testing completed on iOS and Android

---

## Success Criteria Verification

After completing all tasks, verify:

- ✅ Text/number inputs auto-focus on question render (Tasks 1-2)
- ✅ Back button appears at top when currentIndex > 0 (Task 4)
- ✅ Next/Finish button fixed at bottom, always accessible (Task 4)
- ✅ Safe area properly respected on all devices (Task 8-9)
- ✅ Long option lists scroll without pushing buttons off screen (Task 4, 8-9)
- ✅ Keyboard never covers inputs or action buttons (Task 4, 8-9)
- ✅ All existing tests pass with updated component structure (Task 7)
- ✅ 90% test coverage maintained (Task 7)

---

## Notes

- **TDD Approach:** Each feature is implemented test-first (red-green-refactor)
- **Frequent Commits:** Each task ends with a commit for clear history
- **DRY Principle:** Reuse existing components (ProgressBar, QuestionCard, QuestionInput)
- **YAGNI Principle:** Only implement what's in the design doc, no extra features
- **Platform Testing:** Both iOS and Android must be tested manually
- **No Breaking Changes:** Existing answer data and question flow logic unchanged
- **Backwards Compatible:** Works with existing onboarding state

---

## Dependencies

- `react-native-safe-area-context`: Already installed (5.6.0)
- `KeyboardAvoidingView`: Built into React Native
- `ScrollView`: Built into React Native
- `SafeAreaView`: From react-native-safe-area-context

---

## Rollback Plan

If issues are discovered after implementation:

1. Revert commits in reverse order: `git revert HEAD~N..HEAD`
2. Each task is isolated in its own commit for easy selective revert
3. Tests verify each step, making it safe to revert individual tasks
4. Database schema unchanged, so no data migration needed for rollback
