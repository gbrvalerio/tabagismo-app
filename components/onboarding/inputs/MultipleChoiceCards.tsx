import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useThemeColor } from '@/hooks/use-theme-color';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

interface MultipleChoiceCardsProps {
  choices: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultipleChoiceCards({ choices, value, onChange }: MultipleChoiceCardsProps) {
  const textColor = useThemeColor({}, 'text');
  const tint = useThemeColor({}, 'tint');

  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isSelected = value.includes(choice);
    if (isSelected) {
      onChange(value.filter(v => v !== choice));
    } else {
      onChange([...value, choice]);
    }
  };

  return (
    <View style={styles.container}>
      {choices.map((choice) => {
        const isSelected = value.includes(choice);
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
