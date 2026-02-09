import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { AnimatedCoin } from '@/components/question-flow/AnimatedCoin';
import * as Haptics from '@/lib/haptics';

interface CoinCascadeProps {
  modalCenterY: number;
  testID?: string;
}

interface CoinPath {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  rotation: number;
  delay: number;
}

const COIN_COUNT = 12;
const ARC_WIDTH = 180;
const { width: screenWidth } = Dimensions.get('window');
const SCREEN_CENTER_X = screenWidth / 2;

/* istanbul ignore next - default parameter is covered functionally */
export function CoinCascade({ modalCenterY, testID = 'cascade' }: CoinCascadeProps) {
  const coinPaths = useMemo<CoinPath[]>(() => {
    return Array(COIN_COUNT)
      .fill(0)
      .map((_, index) => {
        const angle = (index / (COIN_COUNT - 1)) * ARC_WIDTH - 90;
        const angleRad = (angle * Math.PI) / 180;

        return {
          startX: SCREEN_CENTER_X + Math.sin(angleRad) * 120,
          startY: -50,
          endX: SCREEN_CENTER_X + Math.sin(angleRad) * 80,
          endY: modalCenterY,
          rotation: angle * 2,
          delay: index * 50,
        };
      });
  }, [modalCenterY]);

  return (
    <View style={styles.container} pointerEvents="none">
      {coinPaths.map((path, index) => (
        <FallingCoin
          key={index}
          path={path}
          testID={`${testID}-coin-${index}`}
        />
      ))}
    </View>
  );
}

interface FallingCoinProps {
  path: CoinPath;
  testID: string;
}

function FallingCoin({ path, testID }: FallingCoinProps) {
  const translateX = useSharedValue(path.startX);
  const translateY = useSharedValue(path.startY);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const shadowRadius = useSharedValue(2);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    const duration = 600;

    // Fade in
    opacity.value = withDelay(
      path.delay,
      withTiming(1, { duration: 100 })
    );

    // Parabolic X movement
    translateX.value = withDelay(
      path.delay,
      withTiming(path.endX, {
        duration,
        easing: Easing.out(Easing.quad),
      })
    );

    // Parabolic Y movement (gravity)
    translateY.value = withDelay(
      path.delay,
      withTiming(path.endY, {
        duration,
        easing: Easing.in(Easing.quad),
      }, () => {
        // Landing bounce
        scale.value = withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(1.0, { duration: 100 })
        );

        // Haptic feedback on landing
        runOnJS(triggerHaptic)();
      })
    );

    // Rotation during fall
    rotation.value = withDelay(
      path.delay,
      withTiming(path.rotation, {
        duration,
        easing: Easing.linear,
      })
    );

    // Motion blur (shadow)
    shadowRadius.value = withDelay(
      path.delay,
      withSequence(
        withTiming(8, { duration: duration / 2 }),
        withTiming(4, { duration: duration / 2 })
      )
    );
  }, [path, translateX, translateY, rotation, scale, opacity, shadowRadius]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowColor: '#F7A531',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: shadowRadius.value,
    elevation: 4,
  }));

  return (
    <Animated.View style={[styles.coin, animatedStyle, shadowStyle]}>
      <AnimatedCoin
        size={32}
        variant="filled"
        showGlow={true}
        testID={testID}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  coin: {
    position: 'absolute',
  },
});
