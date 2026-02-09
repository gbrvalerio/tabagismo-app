import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { typographyPresets, colors, shadows, borderRadius } from '@/lib/theme/tokens';

interface SlotMachineCounterProps {
  value: number;
  testID?: string;
}

export function SlotMachineCounter({
  value,
  testID = 'slot-counter',
}: SlotMachineCounterProps) {
  const digits = value.toString().split('').map(Number);

  return (
    <LinearGradient
      colors={['#FFED4E', '#F7A531', '#E68A00']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View testID={testID} style={styles.content}>
        <PlusSymbol />
        {digits.map((digit, index) => (
          <DigitReel
            key={index}
            targetDigit={digit}
            delay={index * 80}
            testID={`${testID}-digit-${index}`}
          />
        ))}
      </View>
    </LinearGradient>
  );
}

function PlusSymbol() {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[styles.plusSymbol, animatedStyle]}>
      +
    </Animated.Text>
  );
}

interface DigitReelProps {
  targetDigit: number;
  delay: number;
  testID: string;
}

function DigitReel({ targetDigit, delay, testID }: DigitReelProps) {
  const digitHeight = 40;
  const translateY = useSharedValue(-digitHeight * 10);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withSequence(
        withTiming(-digitHeight * (targetDigit - 1), {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        }),
        withSpring(-digitHeight * targetDigit, {
          damping: 15,
          stiffness: 150,
          overshootClamping: false,
        })
      )
    );
  }, [targetDigit, delay, digitHeight, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.reelWindow} testID={testID}>
      <Animated.View style={animatedStyle}>
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
          <Text key={digit} style={[styles.digit, { height: digitHeight }]}>
            {digit}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    ...shadows.md,
    shadowColor: colors.accent.gold,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plusSymbol: {
    ...typographyPresets.coinCounter,
    fontSize: 24,
    color: colors.neutral.white,
    marginRight: 4,
  },
  reelWindow: {
    height: 40,
    overflow: 'hidden',
  },
  digit: {
    ...typographyPresets.coinCounter,
    fontSize: 32,
    color: colors.neutral.white,
    textAlign: 'center',
    minWidth: 20,
  },
});
