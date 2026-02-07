import { View, Text, Button, StyleSheet } from 'react-native';
import { useOnboardingStatus, useCompleteOnboarding } from '@/db';

export default function HomeScreen() {
  const { data: onboardingCompleted, isLoading } = useOnboardingStatus();
  const completeMutation = useCompleteOnboarding();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading onboarding status...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  saving: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});
