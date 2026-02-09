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
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  useOnboardingSlides,
  useMarkSlidesCompleted,
} from '@/db/repositories/onboarding-slides.repository';
import { SlideItem, PaginationDots } from '@/components/onboarding-slides';
import { colors, spacing, typographyPresets } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data: slides, isLoading } = useOnboardingSlides();
  const markCompleted = useMarkSlidesCompleted();
  const router = useRouter();

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / event.nativeEvent.layoutMeasurement.width);
    setCurrentIndex(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSkip = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markCompleted.mutateAsync();
    router.push('/onboarding' as never);
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
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <ActivityIndicator testID="loading-indicator" color={colors.primary.base} />
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {currentIndex >= 1 && (
          <Animated.View
            entering={FadeInDown.springify()}
            style={styles.skipContainer}
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
    top: spacing.md,
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
});
