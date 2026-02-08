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

import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

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

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderColor = () => {
    if (hasError) return colors.semantic.error;
    if (isFocused) return colors.primary.base;
    return colors.neutral.gray[300];
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
      <View style={styles.inputWrapper}>
        <TextInput
          testID={testID ? `${testID}-input` : undefined}
          style={[
            styles.input,
            {
              color: textColor,
              borderColor: getBorderColor(),
            },
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
      </View>
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
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
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
