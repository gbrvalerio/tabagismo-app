import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '@/lib/theme/tokens';
import { animations } from '@/lib/theme/animations';

interface QuestionCardProps {
  children: React.ReactNode;
}

export function QuestionCard({ children }: QuestionCardProps) {
  const translateY = useSharedValue(60);
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(-2);

  useEffect(() => {
    translateY.value = withSpring(0, animations.gentleSpring);
    scale.value = withSpring(1, animations.gentleSpring);
    opacity.value = withTiming(1, { duration: 400 });
    rotate.value = withSequence(
      withSpring(2, { ...animations.gentleSpring, damping: 8 }),
      withSpring(0, animations.gentleSpring)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.shadowWrapper}>
        <View style={styles.card}>
          <View style={styles.accentBar} />
          {children}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.lg,
  },
  shadowWrapper: {
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  card: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral.white,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary.base,
  },
});
