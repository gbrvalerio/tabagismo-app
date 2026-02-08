import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing, borderRadius, typography, shadows } from '@/lib/theme/tokens';

interface SingleChoiceCardsProps {
  choices: string[];
  value: string | null;
  onChange: (value: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function SingleChoiceCards({ choices, value, onChange }: SingleChoiceCardsProps) {
  const handlePress = (choice: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onChange(choice);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Escolha uma opção</Text>
        </View>
      </View>
      {choices.map((choice) => {
        const isSelected = value === choice;
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
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioCircleInner} />}
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
    marginBottom: spacing.sm,
  },
  badge: {
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.poppins.regular,
    color: colors.neutral.gray[600],
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
    borderColor: colors.primary.base,
    backgroundColor: `${colors.primary.base}0D`, // 5% opacity
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral.gray[400],
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.primary.base,
    backgroundColor: colors.neutral.white,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary.base,
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
    color: colors.primary.dark,
    flex: 1,
  },
});
