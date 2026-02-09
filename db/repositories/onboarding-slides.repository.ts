import { useQuery } from '@tanstack/react-query';
import { asc } from 'drizzle-orm';
import { db } from '../client';
import { onboardingSlides } from '../schema/onboarding-slides';

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
