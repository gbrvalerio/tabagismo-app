import { TextInput, StyleSheet, View } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRef, useEffect, useState } from 'react';

interface OnboardingNumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder: string;
}

export function OnboardingNumberInput({ value, onChange, placeholder }: OnboardingNumberInputProps) {
  const color = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'icon');
  const inputRef = useRef<TextInput>(null);
  const [localText, setLocalText] = useState(value?.toString() ?? '');

  useEffect(() => {
    // Small delay to ensure smooth transition from previous question
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Sync local text with external value changes
  useEffect(() => {
    setLocalText(value?.toString() ?? '');
  }, [value]);

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

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        value={localText}
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
