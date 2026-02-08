import { useEffect, useRef } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { CoinSvg } from './CoinSvg';

interface AnimatedCoinProps {
  size: number;
  variant: 'outlined' | 'filled';
  animate?: boolean;
  animateToSize?: number;
  highlighted?: boolean;
  showGlow?: boolean;
  onAnimationComplete?: () => void;
  testID?: string;
}

export function AnimatedCoin({
  size,
  variant,
  animate = false,
  animateToSize,
  highlighted = false,
  showGlow = false,
  onAnimationComplete,
  testID = 'animated-coin',
}: AnimatedCoinProps) {
  const scaleX = useSharedValue(1);
  const scale = useSharedValue(1);
  const glowRadius = useSharedValue(4);
  const animatedSize = useSharedValue(size);
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

      // Glow pulse synchronized with flip: 4 → 12 → 6px
      glowRadius.value = withSequence(
        withTiming(12, { duration: 300, easing: Easing.inOut(Easing.cubic) }),
        withTiming(6, { duration: 300, easing: Easing.inOut(Easing.cubic) })
      );

      // Size growth animation: size → animateToSize over 600ms
      if (animateToSize && animateToSize !== size) {
        animatedSize.value = withTiming(animateToSize, {
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
        });
      }

      // Call onAnimationComplete after 600ms
      if (onAnimationComplete) {
        const timeout = setTimeout(() => {
          onAnimationComplete();
        }, 600);
        return () => clearTimeout(timeout);
      }
    }
  }, [animate, scaleX, glowRadius, animatedSize, animateToSize, size, onAnimationComplete]);

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
    width: animatedSize.value,
    height: animatedSize.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowColor: '#F7A531',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: glowRadius.value,
    elevation: 4,
  }));

  // Use target size for CoinSvg so SVG renders at full resolution
  const svgSize = animateToSize ?? size;

  const coinContent = (
    <Animated.View testID={testID} style={[animatedStyle, { overflow: 'hidden' }]}>
      <CoinSvg
        size={svgSize}
        variant={variant}
        showGlow={showGlow}
      />
    </Animated.View>
  );

  if (showGlow) {
    return (
      <Animated.View testID={`${testID}-glow`} style={glowStyle}>
        {coinContent}
      </Animated.View>
    );
  }

  return coinContent;
}
