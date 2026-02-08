import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useOnboardingQuestions, useOnboardingAnswers, useSaveAnswer, useDeleteDependentAnswers, useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';
import { computeApplicableQuestions, calculateProgress } from '@/lib/onboarding-flow';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuestionText } from './QuestionText';
import { QuestionInput } from './QuestionInput';
import type { Question } from '@/db/schema';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});
  const [applicableQuestions, setApplicableQuestions] = useState<Question[]>([]);

  const { data: allQuestions, isLoading: questionsLoading } = useOnboardingQuestions();
  const { data: existingAnswers, isLoading: answersLoading } = useOnboardingAnswers();
  const saveAnswerMutation = useSaveAnswer();
  const deleteDependentAnswersMutation = useDeleteDependentAnswers();
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();

  const isLoading = questionsLoading || answersLoading;

  useEffect(() => {
    if (!allQuestions || !existingAnswers) return;

    // Load existing answers into cache
    const cache = existingAnswers.reduce((acc, answer) => {
      acc[answer.questionKey] = JSON.parse(answer.answer);
      return acc;
    }, {} as Record<string, unknown>);

    setAnswersCache(cache);

    // Compute applicable questions
    const applicable = computeApplicableQuestions(allQuestions, cache);
    setApplicableQuestions(applicable);

    // Find first unanswered question
    const firstUnanswered = applicable.findIndex(q => !cache[q.key]);
    setCurrentIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
  }, [allQuestions, existingAnswers]);

  const handleAnswer = async (questionKey: string, value: unknown) => {
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
    router.replace('/(tabs)');
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
    <View style={styles.container}>
      <ProgressBar progress={progress} />
      {currentQuestion && (
        <QuestionCard>
          <QuestionText text={currentQuestion.questionText} />
          <QuestionInput
            question={currentQuestion}
            value={answersCache[currentQuestion.key] ?? null}
            onChange={(value) => handleAnswer(currentQuestion.key, value)}
          />
        </QuestionCard>
      )}
      <View style={styles.navigationContainer}>
        {currentIndex > 0 && (
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.buttonText}>Voltar</Text>
          </TouchableOpacity>
        )}
        {isAnswered && !isLastQuestion && (
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <Text style={styles.buttonText}>Próxima</Text>
          </TouchableOpacity>
        )}
        {isAnswered && isLastQuestion && (
          <TouchableOpacity onPress={handleFinish} style={styles.finishButton}>
            <Text style={styles.buttonText}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral.gray[300],
    borderRadius: borderRadius.md,
  },
  nextButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.md,
    marginLeft: 'auto',
  },
  finishButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.secondary.base,
    borderRadius: borderRadius.md,
    marginLeft: 'auto',
  },
  buttonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.white,
  },
});
