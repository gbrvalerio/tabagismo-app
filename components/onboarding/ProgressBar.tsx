import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';
import { animations } from '@/lib/theme/animations';

interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withSpring(progress, animations.gentleSpring);
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { backgroundColor: tint }, animatedStyle]} />
      </View>
      <Text style={[styles.text, { color: textColor }]}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: spacing.md,
  },
  track: {
    height: 8,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral.gray[200],
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
  text: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
    textAlign: 'right',
  },
});
