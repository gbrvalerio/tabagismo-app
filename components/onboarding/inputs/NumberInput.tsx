import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useEffect } from 'react';

interface OnboardingNumberInputProps {
  value: number | null;
  onChange: (value: number) => void;
  placeholder: string;
}

export function OnboardingNumberInput({ value, onChange, placeholder }: OnboardingNumberInputProps) {
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

  const handleChange = (text: string) => {
    const num = parseInt(text, 10);
    if (!isNaN(num)) {
      onChange(num);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={value?.toString() ?? ''}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={borderColor}
        keyboardType="numeric"
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
