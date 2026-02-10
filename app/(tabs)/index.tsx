import { View, Text, Button, Alert, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { useRouter, Href } from 'expo-router';
import {
  useOnboardingStatus,
  useCompleteOnboarding,
  useResetOnboarding,
  useDeleteAllAnswers,
  useResetUserCoins,
} from '@/db';
import { useResetSlidesCompleted } from '@/db/repositories/onboarding-slides.repository';
import { impactAsync, ImpactFeedbackStyle } from '@/lib/haptics';
import { colors, spacing } from '@/lib/theme/tokens';

export default function HomeScreen() {
  const { data: onboardingCompleted, isLoading } = useOnboardingStatus();
  const completeMutation = useCompleteOnboarding();
  const resetMutation = useResetOnboarding();
  const deleteAllAnswersMutation = useDeleteAllAnswers('onboarding');
  const resetCoinsMutation = useResetUserCoins();
  const resetSlidesMutation = useResetSlidesCompleted();
  const router = useRouter();

  const handleResetOnboarding = () => {
    Alert.alert(
      'Refazer Onboarding',
      'Deseja refazer o onboarding? Todas as suas respostas e moedas serão apagadas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Refazer',
          style: 'destructive',
          onPress: async () => {
            await deleteAllAnswersMutation.mutateAsync();
            await resetCoinsMutation.mutateAsync();
            await resetSlidesMutation.mutateAsync();
            await resetMutation.mutateAsync();
            router.replace('/onboarding-slides' as Href);
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading onboarding status...</Text>
      </View>
    );
  }

  const handleGearPress = () => {
    impactAsync(ImpactFeedbackStyle.Light);
    router.push('/settings' as Href);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.gearButton}
        onPress={handleGearPress}
        hitSlop={8}
        testID="gear-button"
      >
        <Text style={styles.gearIcon}>⚙️</Text>
      </Pressable>
      <Text style={styles.title}>Database Test</Text>

      <View style={styles.statusContainer}>
        <Text style={styles.label}>Onboarding Status:</Text>
        <Text style={styles.value}>
          {onboardingCompleted ? 'Completed ✅' : 'Not Completed ❌'}
        </Text>
      </View>

      {!onboardingCompleted && (
        <Button
          title="Complete Onboarding"
          onPress={() => completeMutation.mutate()}
          disabled={completeMutation.isPending}
        />
      )}

      {onboardingCompleted && (
        <TouchableOpacity
          style={styles.resetButton}
          onPress={handleResetOnboarding}
          disabled={
            resetMutation.isPending ||
            deleteAllAnswersMutation.isPending ||
            resetCoinsMutation.isPending ||
            resetSlidesMutation.isPending
          }
          testID="reset-onboarding-button"
        >
          <Text style={styles.resetButtonText}>
            {resetMutation.isPending ||
            deleteAllAnswersMutation.isPending ||
            resetCoinsMutation.isPending ||
            resetSlidesMutation.isPending
              ? 'Resetando...'
              : 'Refazer Onboarding'}
          </Text>
        </TouchableOpacity>
      )}

      {completeMutation.isPending && (
        <Text style={styles.saving}>Saving...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  gearButton: {
    position: 'absolute',
    top: 0,
    right: spacing.md,
    zIndex: 1,
    padding: 10,
  },
  gearIcon: {
    fontSize: 24,
    color: colors.neutral.gray[600],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  statusContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#666',
    borderRadius: 8,
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  saving: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
