import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';
import { animations } from '@/lib/theme/animations';

interface ProgressBarProps {
  progress: number;
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ progress, currentStep, totalSteps }: ProgressBarProps) {
  const width = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    width.value = withSpring(progress, animations.gentleSpring);
    scale.value = withSequence(
      withTiming(1.05, { duration: 150 }),
      withTiming(1, { duration: 150 })
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Sua Jornada</Text>
        <Animated.View style={pulseStyle}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{currentStep}/{totalSteps}</Text>
          </View>
        </Animated.View>
      </View>
      <View style={styles.trackContainer}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, animatedStyle]} />
        </View>
        {/* Progress dots */}
        <View style={styles.dotsContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index < currentStep && styles.dotCompleted,
                index === currentStep - 1 && styles.dotActive,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.black,
  },
  badge: {
    backgroundColor: colors.neutral.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary.base,
  },
  badgeText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.black,
    color: colors.primary.base,
  },
  trackContainer: {
    position: 'relative',
  },
  track: {
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.gray[200],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.base,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.gray[300],
  },
  dotCompleted: {
    backgroundColor: colors.primary.base,
  },
  dotActive: {
    backgroundColor: colors.primary.base,
    width: 12,
    height: 12,
    ...shadows.sm,
  },
});
