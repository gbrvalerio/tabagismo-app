import { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
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

        // Remove dependent answers from cache
        const dependentKeys = allQuestions
          .filter(q => q.dependsOnQuestionKey === questionKey)
          .map(q => q.key);
        for (const key of dependentKeys) {
          delete newCache[key];
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
    <View style={styles.background}>
      <View style={styles.container}>
        <ProgressBar progress={progress} currentStep={answeredCount + 1} totalSteps={applicableQuestions.length} />
        {currentQuestion && (
          <QuestionCard>
            <QuestionText text={currentQuestion.questionText} />
            <QuestionInput
              question={currentQuestion}
              value={(answersCache[currentQuestion.key] as string | number | string[] | undefined) ?? null}
              onChange={(value) => handleAnswer(currentQuestion.key, value)}
            />
          </QuestionCard>
        )}
        <View style={styles.navigationContainer}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
              <Text style={styles.backButtonText}>← Voltar</Text>
            </TouchableOpacity>
          )}
          {isAnswered && !isLastQuestion && (
            <TouchableOpacity
              onPress={handleNext}
              activeOpacity={0.7}
              style={[styles.nextButton, currentIndex === 0 && { marginLeft: 'auto' }]}
            >
              <Text style={styles.buttonText}>Próxima →</Text>
            </TouchableOpacity>
          )}
          {isAnswered && isLastQuestion && (
            <TouchableOpacity
              onPress={handleFinish}
              activeOpacity={0.7}
              style={[styles.finishButton, currentIndex === 0 && { marginLeft: 'auto' }]}
            >
              <Text style={styles.finishButtonText}>✓ Concluir</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
    padding: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral.gray[300],
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.gray[600],
  },
  nextButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.full,
    ...shadows.md,
  },
  finishButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.semantic.success,
    borderRadius: borderRadius.full,
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
