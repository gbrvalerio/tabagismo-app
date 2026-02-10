import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { QuestionFlowContainer } from '@/components/question-flow/QuestionFlowContainer';
import { CelebrationDialog } from '@/components/celebration/CelebrationDialog';
import { useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();
  const [showCelebration, setShowCelebration] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const handleComplete = async (totalCoinsEarned: number) => {
    await completeOnboardingMutation.mutateAsync();
    setCoinsEarned(totalCoinsEarned);
    setShowCelebration(true);
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    // @ts-expect-error - Route not in typed routes
    router.replace('/notification-permission');
  };

  return (
    <View style={styles.container}>
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={handleComplete}
      />
      <CelebrationDialog
        visible={showCelebration}
        onDismiss={handleCelebrationDismiss}
        title="Parabéns!"
        subtitle="Você completou seu perfil!"
        coinsEarned={coinsEarned}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
