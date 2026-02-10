import { useEffect } from 'react';
import { useRouter, Href } from 'expo-router';
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
      router.replace('/onboarding-slides' as Href);
      return;
    }

    if (onboardingCompleted === false) {
      router.replace('/onboarding' as Href);
    }
  }, [slidesCompleted, onboardingCompleted, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
