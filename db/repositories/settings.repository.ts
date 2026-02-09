import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eq } from 'drizzle-orm';
import { db } from '../client';
import { settings } from '../schema';

// Query: Get onboarding status
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['settings', 'onboardingCompleted'],
    queryFn: async () => {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'onboardingCompleted'))
        .get();

      return result?.value === 'true';
    },
  });
}

// Mutation: Reset onboarding status
export function useResetOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .update(settings)
        .set({ value: 'false', updatedAt: new Date() })
        .where(eq(settings.key, 'onboardingCompleted'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'onboardingCompleted']
      });
    },
  });
}

// Mutation: Mark onboarding as completed
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .insert(settings)
        .values({
          key: 'onboardingCompleted',
          value: 'true'
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: 'true', updatedAt: new Date() }
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'onboardingCompleted']
      });
    },
  });
}
