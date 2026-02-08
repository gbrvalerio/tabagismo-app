import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { spacing } from '@/lib/theme/tokens';
import { animations } from '@/lib/theme/animations';

interface QuestionCardProps {
  children: React.ReactNode;
}

export function QuestionCard({ children }: QuestionCardProps) {
  const translateX = useSharedValue(80);
  const scale = useSharedValue(0.95);
  const opacity = useSharedValue(0);

  useEffect(() => {
    translateX.value = withSpring(0, animations.gentleSpring);
    scale.value = withSpring(1, animations.gentleSpring);
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    width: '100%',
  },
});
