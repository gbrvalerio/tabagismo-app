import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { useUserCoins } from '@/db/repositories';
import { CoinIcon } from './CoinIcon';
import { colors, spacing, typography } from '@/lib/theme/tokens';

interface CoinCounterProps {
  testID?: string;
}

export function CoinCounter({ testID }: CoinCounterProps) {
  const { data: coins = 0 } = useUserCoins();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (coins > 0) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 10, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
    }
  }, [coins, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View testID={testID} style={[styles.container, animatedStyle]}>
      <CoinIcon size={20} variant="filled" />
      <Text style={styles.count}>{coins}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  count: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
  },
});
