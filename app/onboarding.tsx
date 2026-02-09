import { View, StyleSheet } from 'react-native';
import { QuestionFlowContainer } from '@/components/question-flow/QuestionFlowContainer';
import { useCompleteOnboarding } from '@/db/repositories';
import { useRouter } from 'expo-router';

export default function OnboardingScreen() {
  const completeOnboardingMutation = useCompleteOnboarding();
  const router = useRouter();

  const handleComplete = async () => {
    await completeOnboardingMutation.mutateAsync();
    router.replace('/(tabs)/' as any);
  };

  return (
    <View style={styles.container}>
      <QuestionFlowContainer
        context="onboarding"
        coinRewardPerQuestion={1}
        onComplete={handleComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
