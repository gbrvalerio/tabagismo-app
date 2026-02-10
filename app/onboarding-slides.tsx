import React, { useState } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Pressable,
  Text,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { impactAsync, ImpactFeedbackStyle } from '@/lib/haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useOnboardingSlides,
  useMarkSlidesCompleted,
} from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing, borderRadius, typographyPresets } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: slides, isLoading } = useOnboardingSlides();
  const markCompleted = useMarkSlidesCompleted();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
    impactAsync(ImpactFeedbackStyle.Light);
  };

  const handleSkip = async () => {
    impactAsync(ImpactFeedbackStyle.Light);
    await markCompleted.mutateAsync();
    router.replace('/onboarding' as never);
  };

  const handleComplete = async () => {
    impactAsync(ImpactFeedbackStyle.Medium);
    await markCompleted.mutateAsync();
    router.replace('/onboarding' as never);
  };

  const parseMetadata = (metadataString: string | null) => {
    if (!metadataString) return null;
    try {
      return JSON.parse(metadataString);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isLastSlide = slides ? currentIndex === slides.length - 1 : false;

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentIndex >= 1 && !isLastSlide && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={[styles.skipContainer, { top: insets.top + spacing.md }]}
          >
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>Pular</Text>
            </Pressable>
          </Animated.View>
        )}

        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          onMomentumScrollEnd={handleScrollEnd}
          renderItem={({ item }) => {
            const metadata = parseMetadata(item.metadata);
            return (
              <SlideItem
                icon={item.icon}
                title={item.title}
                description={item.description}
                showBenefits={metadata?.showBenefits}
                benefits={metadata?.benefits}
              />
            );
          }}
          keyExtractor={(item) => item.id.toString()}
        />

        <View style={styles.paginationContainer}>
          <PaginationDots total={slides?.length ?? 0} activeIndex={currentIndex} />
        </View>

        {isLastSlide && (
          <Animated.View
            entering={FadeInDown.springify().damping(12).stiffness(200)}
            style={styles.ctaContainer}
          >
            <Pressable
              onPress={handleComplete}
              style={({ pressed }) => [
                styles.ctaButton,
                pressed && styles.ctaButtonPressed,
              ]}
            >
              <LinearGradient
                colors={['#F7A531', '#F39119']}
                style={styles.ctaGradient}
              >
                <Text style={styles.ctaText}>Vamos Lá!</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
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
  skipContainer: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  skipText: {
    ...typographyPresets.body,
    fontSize: 14,
    color: colors.neutral.gray[600],
  },
  paginationContainer: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  ctaContainer: {
    position: 'absolute',
    bottom: spacing.xl,
    left: spacing.xl,
    right: spacing.xl,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  ctaButtonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  ctaGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  ctaText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
});
