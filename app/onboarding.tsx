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

  const handleComplete = async () => {
    await completeOnboardingMutation.mutateAsync();
    setShowCelebration(true);
  };

  const handleCelebrationComplete = () => {
    setShowCelebration(false);
    router.push('/notification-permission');
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
        onComplete={handleCelebrationComplete}
        title="Parabéns!"
        message="Você completou seu perfil!"
        coins={0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
