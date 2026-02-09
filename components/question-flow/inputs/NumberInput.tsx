import { TextInput, StyleSheet, View, Text, Pressable } from 'react-native';
import { useRef, useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from '@/lib/haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';

interface OnboardingNumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
}

export function OnboardingNumberInput({ value, onChange, placeholder }: OnboardingNumberInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [localText, setLocalText] = useState(value?.toString() ?? '');
  const [isFocused, setIsFocused] = useState(false);

  // Animated values - initialize based on whether there's a value
  const labelPosition = useSharedValue(value !== null ? 1 : 0);
  const borderProgress = useSharedValue(value !== null ? 0.5 : 0);
  const numberPulse = useSharedValue(1);

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Sync local text with external value changes
  useEffect(() => {
    setLocalText(value?.toString() ?? '');
  }, [value]);

  // Animate label on focus/value change
  useEffect(() => {
    const shouldFloat = isFocused || localText.length > 0;
    labelPosition.value = withTiming(shouldFloat ? 1 : 0, {
      duration: 150,
      easing: Easing.out(Easing.cubic),
    });
  }, [isFocused, localText]);

  // Border animation
  useEffect(() => {
    if (isFocused) {
      borderProgress.value = withTiming(1, {
        duration: 150,
        easing: Easing.out(Easing.cubic),
      });
    } else if (localText.length > 0) {
      borderProgress.value = withTiming(0.5, {
        duration: 150,
      });
    } else {
      borderProgress.value = withTiming(0, {
        duration: 150,
      });
    }
  }, [isFocused, localText]);

  // Number pulse effect on change
  useEffect(() => {
    if (localText.length > 0 && !isNaN(Number(localText))) {
      numberPulse.value = withSequence(
        withTiming(1.15, { duration: 100 }),
        withTiming(1, { duration: 200 })
      );
    }
  }, [localText]);

  const handleChange = (text: string) => {
    setLocalText(text);

    if (text === '') {
      onChange(null);
    } else {
      const num = parseInt(text, 10);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

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
      [colors.neutral.gray[400], colors.secondary.base]
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
      [colors.neutral.gray[300], colors.neutral.gray[400], colors.secondary.base]
    );

    return {
      borderBottomColor,
    };
  });

  const numberIndicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scale: numberPulse.value }],
  }));

  const hasValidNumber = localText.length > 0 && !isNaN(Number(localText));

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={handlePressContainer} accessible={false}>
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
              value={localText}
              onChangeText={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder=""
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="transparent"
            />

            {/* Number indicator badge */}
            {hasValidNumber && (
              <Animated.View style={[styles.numberBadge, numberIndicatorStyle]}>
                <Text style={styles.numberBadgeText}>#</Text>
              </Animated.View>
            )}
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
    paddingRight: spacing.xxl + spacing.lg,
  },
  numberBadge: {
    position: 'absolute',
    right: spacing.lg,
    top: '50%',
    marginTop: -16,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary.base,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  numberBadgeText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.poppins.bold,
    color: colors.neutral.white,
  },
});
