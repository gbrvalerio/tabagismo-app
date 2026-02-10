import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStatus } from '@/db/repositories';
import { useSlidesStatus } from '@/db/repositories/onboarding-slides.repository';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const { data: slidesCompleted, isLoading: slidesLoading } = useSlidesStatus();
  const { data: onboardingCompleted, isLoading: onboardingLoading } = useOnboardingStatus();

  const isLoading = slidesLoading || onboardingLoading;

  useEffect(() => {
    if (isLoading) return;

    // Priority: slides → onboarding → tabs
    if (slidesCompleted === false) {
      // @ts-expect-error - Route not in typed routes
      router.replace('/onboarding-slides');
      return;
    }

    if (onboardingCompleted === false) {
      // @ts-expect-error - Route not in typed routes
      router.replace('/onboarding');
    }
  }, [slidesCompleted, onboardingCompleted, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
