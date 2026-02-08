import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';

interface MultipleChoiceCardsProps {
  choices: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function MultipleChoiceCards({ choices, value, onChange }: MultipleChoiceCardsProps) {
  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const isSelected = value.includes(choice);
    if (isSelected) {
      onChange(value.filter(v => v !== choice));
    } else {
      onChange([...value, choice]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Escolha uma ou mais opções</Text>
        </View>
        {value.length > 0 && (
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{value.length}</Text>
          </View>
        )}
      </View>
      {choices.map((choice) => {
        const isSelected = value.includes(choice);
        return (
          <ChoiceCard
            key={choice}
            choice={choice}
            isSelected={isSelected}
            onPress={() => handlePress(choice)}
          />
        );
      })}
    </View>
  );
}

function ChoiceCard({
  choice,
  isSelected,
  onPress,
}: {
  choice: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      accessible
      testID={`choice-${choice}`}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.cardWrapper, animatedStyle]}
      activeOpacity={0.9}
    >
      <View style={[styles.card, isSelected && styles.selectedCard]}>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkboxText}>✓</Text>}
        </View>
        <Text style={[styles.text, isSelected && styles.selectedText]}>{choice}</Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: colors.neutral.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.neutral.gray[300],
    flex: 1,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray[600],
  },
  counterBadge: {
    backgroundColor: colors.secondary.base,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  counterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.neutral.gray[300],
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedCard: {
    borderColor: colors.secondary.base,
    backgroundColor: colors.secondary.base,
    ...shadows.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral.gray[400],
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.neutral.white,
    backgroundColor: colors.neutral.white,
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: typography.fontWeight.black,
    color: colors.secondary.base,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.black,
    flex: 1,
  },
  selectedText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    flex: 1,
  },
});
