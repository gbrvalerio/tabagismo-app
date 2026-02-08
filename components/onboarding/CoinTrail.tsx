import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnimatedCoin } from './AnimatedCoin';
import { spacing } from '@/lib/theme/tokens';

interface CoinTrailProps {
  currentStep: number;
  totalSteps: number;
  answeredQuestions: string[];
  animatingCoinIndex?: number | null;
  onCoinAnimationComplete?: () => void;
  testID?: string;
}

export function CoinTrail({
  currentStep,
  totalSteps,
  answeredQuestions,
  animatingCoinIndex = null,
  onCoinAnimationComplete,
  testID,
}: CoinTrailProps) {
  const progress = totalSteps > 0 ? (answeredQuestions.length / totalSteps) * 100 : 0;

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.progressLineContainer}>
        <View
          testID={testID ? `${testID}-progress-bg` : 'coin-trail-progress-bg'}
          style={styles.progressBackground}
        />
        <LinearGradient
          testID={testID ? `${testID}-progress-fill` : 'coin-trail-progress-fill'}
          colors={['#F7A531', '#F39119']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>
      <View style={styles.coinsRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isAnswered = index < answeredQuestions.length;
          const isCurrent = index === currentStep - 1;
          const isAnimating = animatingCoinIndex === index;

          return (
            <AnimatedCoin
              key={index}
              size={16}
              variant={isAnswered ? 'filled' : 'outlined'}
              highlighted={isCurrent}
              showGlow={isAnswered}
              animate={isAnimating}
              onAnimationComplete={isAnimating ? onCoinAnimationComplete : undefined}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  progressLineContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    top: '50%',
    height: 2,
    marginTop: -1,
  },
  progressBackground: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#E5E5E5',
    borderRadius: 1,
  },
  progressFill: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
