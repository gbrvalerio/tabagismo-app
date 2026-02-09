import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingSlides } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem } from '@/components/onboarding-slides';
import { colors } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const { data: slides, isLoading } = useOnboardingSlides();

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.slidesContainer}>
          {slides?.map((slide) => (
            <SlideItem
              key={slide.id}
              icon={slide.icon}
              title={slide.title}
              description={slide.description}
            />
          ))}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  slidesContainer: {
    flex: 1,
  },
});
