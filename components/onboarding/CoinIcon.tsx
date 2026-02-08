import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

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

  return (
    <Animated.View
      testID="coin-icon"
      style={[
        { width: size, height: size, alignItems: 'center', justifyContent: 'center' },
        animatedStyle,
      ]}
    >
      <Text
        style={{
          fontSize: size * 0.8,
          lineHeight: size,
          opacity: variant === 'outlined' ? 0.35 : 1,
        }}
      >
        🪙
      </Text>
    </Animated.View>
  );
}
