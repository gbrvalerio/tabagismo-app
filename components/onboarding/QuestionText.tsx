import { Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface QuestionTextProps {
  text: string;
}

export function QuestionText({ text }: QuestionTextProps) {
  const color = useThemeColor({}, 'text');

  return <Text style={[styles.text, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
});
