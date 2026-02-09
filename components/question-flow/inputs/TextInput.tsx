import { TextInput, StyleSheet, View, Pressable } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

interface OnboardingTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function OnboardingTextInput({ value, onChange, placeholder }: OnboardingTextInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Animated values - initialize based on whether there's a value
  const labelPosition = useSharedValue(value.length > 0 ? 1 : 0);
  const borderProgress = useSharedValue(value.length > 0 ? 0.5 : 0);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Animate label on focus/value change
  useEffect(() => {
    const shouldFloat = isFocused || value.length > 0;
    labelPosition.value = withTiming(shouldFloat ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, value]);

  // Border animation
  useEffect(() => {
    if (isFocused) {
      borderProgress.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    } else if (value.length > 0) {
      borderProgress.value = withTiming(0.5, {
        duration: 150,
      });
    } else {
      borderProgress.value = withTiming(0, {
        duration: 150,
      });
    }
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handlePressContainer = () => {
    inputRef.current?.focus();
  };

  // Animated styles
  const labelStyle = useAnimatedStyle(() => {
    const translateY = labelPosition.value === 1 ? -18 : 0;
    const translateX = labelPosition.value === 1 ? -spacing.lg : 0;
    const scale = labelPosition.value === 1 ? 0.85 : 1;
    const color = interpolateColor(
      labelPosition.value,
      [0, 1],
      [colors.neutral.gray[400], colors.primary.base]
    );

    return {
      transform: [{ translateY }, { translateX }, { scale }],
      color,
    };
  });

  const borderStyle = useAnimatedStyle(() => {
    const borderBottomColor = interpolateColor(
      borderProgress.value,
      [0, 0.5, 1],
      [colors.neutral.gray[300], colors.neutral.gray[400], colors.primary.base]
    );

    return {
      borderBottomColor,
    };
  });

  const maxLength = 100;

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePressContainer} accessible={false} testID="text-input-container">
        <View style={styles.container}>
          {/* Main input container */}
          <Animated.View style={[styles.inputContainer, borderStyle]}>
            {/* Floating label */}
            <Animated.Text style={[styles.label, labelStyle]}>
              {placeholder}
            </Animated.Text>

            {/* Text input */}
            <TextInput
              ref={inputRef}
              value={value}
              onChangeText={onChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder=""
              style={styles.input}
              maxLength={maxLength}
              placeholderTextColor="transparent"
            />
          </Animated.View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    width: '100%',
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
    minHeight: 64,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral.white,
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.neutral.gray[300],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    position: 'absolute',
    left: spacing.lg,
    top: 20,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.poppins.regular,
  },
  input: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.poppins.regular,
    color: colors.neutral.black,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg + spacing.sm,
    paddingBottom: spacing.sm,
    minHeight: 64,
  },
});
