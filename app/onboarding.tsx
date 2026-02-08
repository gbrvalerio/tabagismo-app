import { View, StyleSheet } from 'react-native';
import { OnboardingContainer } from '@/components/onboarding/OnboardingContainer';

export default function OnboardingScreen() {
  return (
    <View style={styles.container}>
      <OnboardingContainer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
