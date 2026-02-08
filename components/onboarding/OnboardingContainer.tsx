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
    fontWeight: typography.fontWeight.medium,
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
