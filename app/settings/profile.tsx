import React, { useState, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter, Href } from 'expo-router';

import { ProfileEditModal } from '@/components/settings/ProfileEditModal';
import {
  useQuestions,
  useAnswers,
  useSaveAnswer,
  useDeleteDependentAnswers,
} from '@/db/repositories/questions.repository';
import type { Question } from '@/db/schema/questions';
import { QuestionCategory, QuestionType } from '@/db/schema/questions';
import { computeApplicableQuestions } from '@/lib/question-flow';
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from '@/lib/theme/tokens';

const CATEGORY_ORDER: QuestionCategory[] = [
  QuestionCategory.PROFILE,
  QuestionCategory.ADDICTION,
  QuestionCategory.HABITS,
  QuestionCategory.MOTIVATION,
  QuestionCategory.GOALS,
];

const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  [QuestionCategory.PROFILE]: 'PERFIL',
  [QuestionCategory.ADDICTION]: 'VICIO',
  [QuestionCategory.HABITS]: 'HABITOS',
  [QuestionCategory.MOTIVATION]: 'MOTIVACAO',
  [QuestionCategory.GOALS]: 'OBJETIVOS',
};

function formatAnswer(answer: string | undefined, questionType: string): string {
  if (!answer) return '—';

  if (questionType === QuestionType.MULTIPLE_CHOICE) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.join(', ');
      }
    } catch {
      return answer;
    }
  }

  return answer;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data: questions, isLoading: questionsLoading } = useQuestions('onboarding');
  const { data: answers, isLoading: answersLoading } = useAnswers('onboarding');
  const saveAnswer = useSaveAnswer('onboarding');
  const deleteDependentAnswers = useDeleteDependentAnswers('onboarding');

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const isLoading = questionsLoading || answersLoading;

  const answersMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (answers) {
      for (const a of answers) {
        map[a.questionKey] = a.answer;
      }
    }
    return map;
  }, [answers]);

  const applicableQuestions = useMemo(() => {
    if (!questions) return [];
    return computeApplicableQuestions(questions, answersMap);
  }, [questions, answersMap]);

  const groupedQuestions = useMemo(() => {
    const groups: Record<string, Question[]> = {};
    for (const q of applicableQuestions) {
      if (!groups[q.category]) {
        groups[q.category] = [];
      }
      groups[q.category].push(q);
    }
    return groups;
  }, [applicableQuestions]);

  const handleSave = useCallback(
    async (answer: string) => {
      if (!editingQuestion) return;

      await saveAnswer.mutateAsync({
        questionKey: editingQuestion.key,
        answer,
      });

      if (editingQuestion.key === 'addiction_type') {
        await deleteDependentAnswers.mutateAsync({
          parentQuestionKey: 'addiction_type',
        });
      }

      setEditingQuestion(null);
    },
    [editingQuestion, saveAnswer, deleteDependentAnswers]
  );

  const hasAnswers = answers && answers.length > 0;

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Perfil' }} />
        <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
          <View style={styles.loadingContainer} testID="profile-loading">
            <ActivityIndicator size="large" color={colors.primary.base} />
          </View>
        </LinearGradient>
      </>
    );
  }

  if (!hasAnswers) {
    return (
      <>
        <Stack.Screen options={{ title: 'Perfil' }} />
        <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
          <View style={styles.emptyContainer}>
            <Pressable
              testID="complete-profile-button"
              style={styles.completeButton}
              onPress={() => router.push('/onboarding' as Href)}
            >
              <Text style={styles.completeButtonText}>Completar perfil</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Perfil' }} />
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {CATEGORY_ORDER.map((category) => {
            const categoryQuestions = groupedQuestions[category];
            if (!categoryQuestions || categoryQuestions.length === 0) return null;

            return (
              <View key={category} style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.accentBar} />
                  <Text style={styles.sectionTitle}>
                    {CATEGORY_LABELS[category]}
                  </Text>
                </View>

                {categoryQuestions.map((question) => {
                  const answer = answersMap[question.key];
                  const displayAnswer = formatAnswer(answer, question.type);

                  return (
                    <Pressable
                      key={question.key}
                      testID={`profile-row-${question.key}`}
                      style={styles.questionRow}
                      onPress={() => setEditingQuestion(question)}
                    >
                      <Text style={styles.questionText}>
                        {question.questionText}
                      </Text>
                      <Text style={styles.answerText}>{displayAnswer}</Text>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        <ProfileEditModal
          visible={!!editingQuestion}
          question={editingQuestion}
          currentAnswer={editingQuestion ? answersMap[editingQuestion.key] ?? null : null}
          onSave={handleSave}
          onClose={() => setEditingQuestion(null)}
        />
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  completeButton: {
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  completeButtonText: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.lg,
    color: colors.neutral.white,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  accentBar: {
    width: 3,
    height: '100%',
    minHeight: 20,
    backgroundColor: colors.primary.base,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray[500],
    textTransform: 'uppercase',
  },
  questionRow: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  questionText: {
    fontFamily: typography.fontFamily.poppins.regular,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray[600],
  },
  answerText: {
    fontFamily: typography.fontFamily.poppins.medium,
    fontSize: typography.fontSize.md,
    color: colors.neutral.black,
    marginTop: 2,
  },
});
