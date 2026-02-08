import { animations, timing } from "@/lib/theme/animations";
import { borderRadius, colors, shadows, spacing } from "@/lib/theme/tokens";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface QuestionCardProps {
  children: React.ReactNode;
  questionKey: string; // Used to trigger transitions on question change
}

export function QuestionCard({ children, questionKey }: QuestionCardProps) {
  const translateX = useSharedValue(50);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);

  useEffect(() => {
    // Reset to initial state
    translateX.value = 50;
    opacity.value = 0;
    scale.value = 0.96;

    // Staggered entrance: fade in, slide in, then subtle scale
    opacity.value = withTiming(1, {
      duration: timing.fast,
      easing: Easing.out(Easing.cubic),
    });

    translateX.value = withSpring(0, {
      ...animations.gentleSpring,
      damping: 18,
      stiffness: 120,
    });

    scale.value = withDelay(
      50,
      withSpring(1, {
        damping: 15,
        stiffness: 140,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionKey]); // Re-trigger animation when question changes

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      testID="question-card"
    >
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
    width: "100%",
    marginTop: spacing.xs,
    flexShrink: 1, // Allows card to shrink when constrained by footer
  },
  shadowWrapper: {
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  card: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral.white,
    overflow: "hidden",
  },
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.primary.base,
  },
});
