import React from 'react';
import { ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboardingSlides } from '@/db/repositories/onboarding-slides.repository';
import { SlideItem } from '@/components/onboarding-slides';
import { colors } from '@/lib/theme/tokens';

export default function OnboardingSlidesScreen() {
  const { data: slides, isLoading } = useOnboardingSlides();

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
        <FlatList
          testID="slides-flatlist"
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
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
});
