import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { CoinIcon } from './CoinIcon';

interface CoinBurstAnimationProps {
  isVisible: boolean;
  onComplete: () => void;
}

export function CoinBurstAnimation({
  isVisible,
  onComplete,
}: CoinBurstAnimationProps) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isVisible) {
      // Reset values
      translateY.value = 0;
      translateX.value = 0;
      rotate.value = 0;
      opacity.value = 0;

      // Arc from center-bottom to top-right
      translateY.value = withTiming(-400, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      translateX.value = withTiming(150, {
        duration: 800,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
      rotate.value = withTiming(720, { duration: 800 });
      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withDelay(600, withTiming(0, { duration: 200 }))
      );

      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete, translateY, translateX, rotate, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  if (!isVisible) return null;

  return (
    <Animated.View
      testID="coin-burst"
      style={[styles.coin, animatedStyle]}
    >
      <CoinIcon size={32} variant="filled" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: {
    position: 'absolute',
    bottom: 200,
    left: '50%',
    marginLeft: -16,
  },
});
