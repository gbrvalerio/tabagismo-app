import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useOnboardingQuestions, useOnboardingAnswers } from '@/db/repositories';
import { computeApplicableQuestions, calculateProgress } from '@/lib/onboarding-flow';
import { ProgressBar } from './ProgressBar';
import { QuestionCard } from './QuestionCard';
import { QuestionText } from './QuestionText';
import { QuestionInput } from './QuestionInput';
import type { Question } from '@/db/schema';
import { spacing } from '@/lib/theme/tokens';

export function OnboardingContainer() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersCache, setAnswersCache] = useState<Record<string, unknown>>({});
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
    }, {} as Record<string, unknown>);

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
          <QuestionInput
            question={currentQuestion}
            value={answersCache[currentQuestion.key] ?? null}
            onChange={() => {}}
          />
        </QuestionCard>
      )}
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
});
