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
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.black,
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
    color: colors.neutral.black,
    lineHeight: typography.fontSize.xxl * typography.lineHeight.tight,
  },
});
