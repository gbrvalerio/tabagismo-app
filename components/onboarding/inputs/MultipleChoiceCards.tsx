import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography } from '@/lib/theme/tokens';

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
    scale.value = withSpring(0.97);
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
    fontFamily: typography.fontFamily.poppins.regular,
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
    fontFamily: typography.fontFamily.poppins.bold,
    color: colors.neutral.white,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.neutral.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  selectedCard: {
    borderColor: colors.secondary.base,
    backgroundColor: `${colors.secondary.base}0D`, // 5% opacity
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
    borderColor: colors.secondary.base,
    backgroundColor: colors.secondary.base,
  },
  checkboxText: {
    fontSize: 16,
    fontFamily: typography.fontFamily.poppins.bold,
    color: colors.neutral.white,
  },
  text: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.poppins.regular,
    color: colors.neutral.black,
    flex: 1,
  },
  selectedText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.poppins.semibold,
    color: colors.secondary.dark,
    flex: 1,
  },
});
