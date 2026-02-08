import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { spacing } from '@/lib/theme/tokens';

interface QuestionCardProps {
  children: React.ReactNode;
}

export function QuestionCard({ children }: QuestionCardProps) {
  return (
    <Animated.View style={styles.container}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    width: '100%',
  },
});
