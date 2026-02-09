import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useOnboardingStatus } from '@/db/repositories';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const router = useRouter();
  const { data: onboardingCompleted, isLoading } = useOnboardingStatus();

  useEffect(() => {
    if (!isLoading && onboardingCompleted === false) {
      // @ts-expect-error - Route not in typed routes
      router.replace('/onboarding');
    }
  }, [onboardingCompleted, isLoading, router]);

  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}
