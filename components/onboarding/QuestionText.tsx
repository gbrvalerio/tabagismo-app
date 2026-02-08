import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/lib/theme/tokens';

interface QuestionTextProps {
  text: string;
}

export function QuestionText({ text }: QuestionTextProps) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    marginTop: 0,
    color: colors.neutral.black,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
});
