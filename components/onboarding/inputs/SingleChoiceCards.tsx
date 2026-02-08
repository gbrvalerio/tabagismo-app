import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

interface SingleChoiceCardsProps {
  choices: string[];
  value: string | null;
  onChange: (value: string) => void;
}

export function SingleChoiceCards({ choices, value, onChange }: SingleChoiceCardsProps) {
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(choice);
  };

  return (
    <View style={styles.container}>
      {choices.map((choice) => {
        const isSelected = value === choice;
        return (
          <TouchableOpacity
            key={choice}
            accessible
            testID={`choice-${choice}`}
            onPress={() => handlePress(choice)}
            style={[
              styles.card,
              isSelected && { backgroundColor: tint, borderColor: tint },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? colors.neutral.white : textColor }]}>
              {choice}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral.gray[300],
    alignItems: 'center',
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
});
