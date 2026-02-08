import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '@/lib/theme/tokens';

interface CoinIconProps {
  size: number;
  variant: 'outlined' | 'filled';
  highlighted?: boolean;
}

export function CoinIcon({ size, variant, highlighted = false }: CoinIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (highlighted) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.2, { damping: 10, stiffness: 100 }),
          withSpring(1, { damping: 10, stiffness: 100 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [highlighted, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const coinStyle = variant === 'outlined' ? styles.outlined : styles.filled;

  return (
    <Animated.View
      testID="coin-icon"
      style={[
        { width: size, height: size, borderRadius: size / 2 },
        coinStyle,
        animatedStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.neutral.gray[300],
  },
  filled: {
    backgroundColor: colors.accent.gold,
  },
});
