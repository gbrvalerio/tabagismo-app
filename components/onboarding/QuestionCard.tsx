import { animations } from "@/lib/theme/animations";
import { borderRadius, colors, shadows, spacing } from "@/lib/theme/tokens";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

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
      withSpring(0, animations.gentleSpring),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    flex: 1,
    width: "100%",
    marginTop: spacing.xs,
  },
  shadowWrapper: {
    flex: 1,
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  card: {
    flex: 1,
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
