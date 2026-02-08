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
      return await db
        .insert(onboardingAnswers)
        .values({ questionKey, answer })
        .onConflictDoUpdate({
          target: onboardingAnswers.questionKey,
          set: {
            answer,
            updatedAt: new Date(),
          },
        })
        .returning();
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

      // Recursively find all descendant question keys
      const keysToDelete = new Set<string>();
      const findDescendants = (parentKey: string) => {
        for (const question of allQuestions) {
          if (question.dependsOnQuestionKey === parentKey && !keysToDelete.has(question.key)) {
            keysToDelete.add(question.key);
            findDescendants(question.key);
          }
        }
      };
      findDescendants(parentQuestionKey);

      // Delete answers for all descendant questions
      for (const key of keysToDelete) {
        await db
          .delete(onboardingAnswers)
          .where(eq(onboardingAnswers.questionKey, key))
          .execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding', 'answers'] });
    },
  });
}
