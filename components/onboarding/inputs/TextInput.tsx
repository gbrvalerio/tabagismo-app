import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useEffect } from 'react';

interface OnboardingTextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function OnboardingTextInput({ value, onChange, placeholder }: OnboardingTextInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Small delay to ensure smooth transition from previous question
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={borderColor}
        style={[styles.input, { color, borderBottomColor: borderColor }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  input: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
});
