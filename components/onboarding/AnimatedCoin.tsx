import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { CoinSvg } from './CoinSvg';

interface AnimatedCoinProps {
  size: number;
  variant: 'outlined' | 'filled';
  animate?: boolean;
  highlighted?: boolean;
  showGlow?: boolean;
  onAnimationComplete?: () => void;
  testID?: string;
}

export function AnimatedCoin({
  size,
  variant,
  animate = false,
  highlighted = false,
  showGlow = false,
  onAnimationComplete,
  testID = 'animated-coin',
}: AnimatedCoinProps) {
  const scaleX = useSharedValue(1);
  const scale = useSharedValue(1);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (animate && !hasAnimated.current) {
      hasAnimated.current = true;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // 3D flip: scaleX 1 → 0 → 1 over 600ms
      scaleX.value = withSequence(
        withTiming(0, { duration: 300, easing: Easing.inOut(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.cubic) })
      );

      // Call onAnimationComplete after 600ms
      if (onAnimationComplete) {
        const timeout = setTimeout(() => {
          onAnimationComplete();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [animate, scaleX, onAnimationComplete]);

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
    transform: [
      { scaleX: scaleX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View testID={testID} style={animatedStyle}>
      <CoinSvg
        size={size}
        variant={variant}
        showGlow={showGlow}
      />
    </Animated.View>
  );
}
