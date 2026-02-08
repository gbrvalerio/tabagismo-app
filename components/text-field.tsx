import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  View,
  Text,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TextInputFocusEventData,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';
import { timing, animations } from '@/lib/theme/animations';

export type TextFieldProps = Omit<TextInputProps, 'editable'> & {
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
  loading?: boolean;
};

export function TextField({
  label,
  helperText,
  error,
  disabled = false,
  loading = false,
  style,
  onFocus,
  onBlur,
  testID,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const hasError = !!error;
  const isDisabled = disabled || loading;

  // Animation shared value: 0 = unfocused, 1 = focused
  const focusAnimation = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => {
    if (hasError) {
      return { borderColor: colors.semantic.error };
    }

    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [colors.neutral.gray[300], colors.primary.base]
    );

    return { borderColor };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, {
      duration: timing.fast,
      easing: animations.easing.easeOut,
    });
    onBlur?.(e);
  };

  return (
    <View
      testID={testID}
      style={[styles.container, disabled && styles.disabled]}
    >
      {label && (
        <Text
          style={[
            styles.label,
            { color: hasError ? colors.semantic.error : textColor },
          ]}
        >
          {label}
        </Text>
      )}
      <Animated.View
        testID={testID ? `${testID}-animated-border` : undefined}
        style={[styles.inputWrapper, styles.inputBorder, animatedBorderStyle]}
      >
        <TextInput
          testID={testID ? `${testID}-input` : undefined}
          style={[
            styles.input,
            { color: textColor },
            style,
          ]}
          placeholderTextColor={iconColor}
          editable={!isDisabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {loading && (
          <ActivityIndicator
            testID={testID ? `${testID}-loading` : undefined}
            size="small"
            color={colors.primary.base}
            style={styles.loadingIndicator}
          />
        )}
      </Animated.View>
      {hasError ? (
        <Text style={[styles.helperText, { color: colors.semantic.error }]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[styles.helperText, { color: iconColor }]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputBorder: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    borderColor: colors.neutral.gray[300],
  },
  input: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.fontSize.md,
  },
  loadingIndicator: {
    position: 'absolute',
    right: spacing.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});
