import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/lib/theme/tokens';

interface RadialBurstProps {
  testID?: string;
}

const LINE_COUNT = 8;

export function RadialBurst({ testID = 'burst' }: RadialBurstProps) {
  const lines = Array(LINE_COUNT)
    .fill(0)
    .map((_, index) => ({
      rotation: (360 / LINE_COUNT) * index,
    }));

  return (
    <View style={styles.container} pointerEvents="none">
      {lines.map((line, index) => (
        <BurstLine
          key={index}
          rotation={line.rotation}
          testID={`${testID}-line-${index}`}
        />
      ))}
    </View>
  );
}

interface BurstLineProps {
  rotation: number;
  testID: string;
}

function BurstLine({ rotation, testID }: BurstLineProps) {
  const scale = useSharedValue(0);
  const lineRotation = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Scale: 0 → 1.5 → 1.0 over 700ms
    scale.value = withSequence(
      withTiming(1.5, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: 300, easing: Easing.out(Easing.cubic) })
    );

    // Rotation: 0° → 15°
    lineRotation.value = withTiming(15, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });

    // Opacity: 0 → 0.6 → 0.3
    opacity.value = withSequence(
      withTiming(0.6, { duration: 200, easing: Easing.out(Easing.cubic) }),
      withTiming(0.3, { duration: 500, easing: Easing.out(Easing.cubic) })
    );
  }, [scale, lineRotation, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { rotate: `${rotation}deg` },
      { scale: scale.value },
      { rotate: `${lineRotation.value}deg` },
    ],
  }));

  return (
    <Animated.View testID={testID} style={[styles.line, animatedStyle]}>
      <LinearGradient
        colors={[colors.accent.gold, 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: {
    position: 'absolute',
    width: 100,
    height: 4,
  },
  gradient: {
    flex: 1,
  },
});
