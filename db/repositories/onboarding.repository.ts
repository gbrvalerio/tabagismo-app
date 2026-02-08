import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
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

export function useDeleteDependentAnswers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentQuestionKey }: { parentQuestionKey: string }) => {
      const allQuestions = await db.select().from(questions).all();
      const dependentQuestions = allQuestions.filter(
        q => q.dependsOnQuestionKey === parentQuestionKey
      );

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
