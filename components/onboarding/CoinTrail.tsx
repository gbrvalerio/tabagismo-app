import { View, StyleSheet } from 'react-native';
import { CoinIcon } from './CoinIcon';
import { spacing } from '@/lib/theme/tokens';

interface CoinTrailProps {
  currentStep: number;
  totalSteps: number;
  answeredQuestions: string[];
  testID?: string;
}

export function CoinTrail({
  currentStep,
  totalSteps,
  answeredQuestions,
  testID,
}: CoinTrailProps) {
  return (
    <View testID={testID} style={styles.container}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isAnswered = index < answeredQuestions.length;
        const isCurrent = index === currentStep - 1;

        return (
          <CoinIcon
            key={index}
            size={12}
            variant={isAnswered ? 'filled' : 'outlined'}
            highlighted={isCurrent}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
