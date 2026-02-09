import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq, and } from 'drizzle-orm';
import { db } from '../client';
import { questions, questionAnswers } from '../schema';

export function useQuestions(context: string) {
  return useQuery({
    queryKey: ['questions', context],
    queryFn: async () => {
      return await db
        .select()
        .from(questions)
        .where(eq(questions.context, context))
        .orderBy(questions.order)
        .all();
    },
  });
}

export function useAnswers(context: string) {
  return useQuery({
    queryKey: ['answers', context],
    queryFn: async () => {
      return await db
        .select()
        .from(questionAnswers)
        .where(eq(questionAnswers.context, context))
        .all();
    },
  });
}

export function useSaveAnswer(context: string) {
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
        .insert(questionAnswers)
        .values({
          context,
          questionKey,
          answer,
          answeredAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [questionAnswers.context, questionAnswers.questionKey, questionAnswers.userId],
          set: {
            answer,
            updatedAt: new Date(),
          },
        })
        .returning();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}

export function useDeleteDependentAnswers(context: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ parentQuestionKey }: { parentQuestionKey: string }) => {
      const allQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.context, context))
        .all();

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

      // Delete answers for all descendant questions in this context
      for (const key of keysToDelete) {
        await db
          .delete(questionAnswers)
          .where(
            and(
              eq(questionAnswers.context, context),
              eq(questionAnswers.questionKey, key)
            )
          )
          .execute();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}

export function useDeleteAllAnswers(context: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .delete(questionAnswers)
        .where(eq(questionAnswers.context, context))
        .execute();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['answers', context] });
    },
  });
}
