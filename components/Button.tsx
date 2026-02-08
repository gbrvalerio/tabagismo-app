import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';
import { animations } from '@/lib/theme/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'minimal';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  testID = 'button',
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const variantStyles = getVariantStyles(variant);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.95, animations.gentleSpring);
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, animations.gentleSpring);
    }
  };

  return (
    <AnimatedPressable
      testID={testID}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      style={[
        styles.base,
        variantStyles.container,
        isDisabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          testID="button-loading"
          color={variantStyles.textColor}
          size="small"
        />
      ) : (
        <Text style={[styles.label, { color: variantStyles.textColor }]}>
          {label}
        </Text>
      )}
    </AnimatedPressable>
  );
}

function getVariantStyles(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return {
        container: styles.primaryContainer,
        textColor: colors.neutral.white,
      };
    case 'secondary':
      return {
        container: styles.secondaryContainer,
        textColor: colors.neutral.white,
      };
    case 'outline':
      return {
        container: styles.outlineContainer,
        textColor: colors.primary.base,
      };
    case 'minimal':
      return {
        container: styles.minimalContainer,
        textColor: colors.primary.base,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  primaryContainer: {
    backgroundColor: colors.primary.base,
  },
  secondaryContainer: {
    backgroundColor: colors.secondary.base,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary.base,
  },
  minimalContainer: {
    backgroundColor: 'transparent',
  },
});
