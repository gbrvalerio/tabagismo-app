import { Text, StyleSheet } from 'react-native';
import { colors, spacing, typographyPresets } from '@/lib/theme/tokens';

interface QuestionTextProps {
  text: string;
}

export function QuestionText({ text }: QuestionTextProps) {
  return <Text style={styles.text}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    ...typographyPresets.hero,
    marginBottom: spacing.sm,
    marginTop: 0,
    color: colors.neutral.black,
  },
});
