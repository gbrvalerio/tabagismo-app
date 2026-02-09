import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { asc, eq } from 'drizzle-orm';
import { db } from '../client';
import { onboardingSlides } from '../schema/onboarding-slides';
import { settings } from '../schema';

export function useOnboardingSlides() {
  return useQuery({
    queryKey: ['onboarding-slides'],
    queryFn: async () => {
      return await db
        .select()
        .from(onboardingSlides)
        .orderBy(asc(onboardingSlides.order))
        .all();
    },
  });
}

export function useMarkSlidesCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await db
        .insert(settings)
        .values({
          key: 'slidesCompleted',
          value: 'true',
        })
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: 'true', updatedAt: new Date() },
        });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['settings', 'slidesCompleted'],
      });
    },
  });
}

export function useSlidesStatus() {
  return useQuery({
    queryKey: ['settings', 'slidesCompleted'],
    queryFn: async () => {
      const result = await db
        .select()
        .from(settings)
        .where(eq(settings.key, 'slidesCompleted'))
        .get();

      return result?.value === 'true';
    },
  });
}
