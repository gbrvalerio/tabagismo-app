import { useState } from 'react';
import {
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
  disabled?: boolean;
};

export function TextField({
  label,
  helperText,
  disabled = false,
  style,
  onFocus,
  onBlur,
  testID,
  ...rest
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View
      testID={testID}
      style={[styles.container, disabled && styles.disabled]}
    >
      {label && (
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      )}
      <TextInput
        testID={testID ? `${testID}-input` : undefined}
        style={[
          styles.input,
          {
            color: textColor,
            borderColor: isFocused
              ? colors.primary.base
              : colors.neutral.gray[300],
          },
          style,
        ]}
        placeholderTextColor={iconColor}
        editable={!disabled}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...rest}
      />
      {helperText && (
        <Text style={[styles.helperText, { color: iconColor }]}>
          {helperText}
        </Text>
      )}
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
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    fontSize: typography.fontSize.md,
  },
  helperText: {
    fontSize: typography.fontSize.xs,
    marginTop: spacing.xs,
  },
});
