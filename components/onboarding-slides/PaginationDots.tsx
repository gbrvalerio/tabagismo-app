import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/theme/tokens';

interface PaginationDotsProps {
  total: number;
  activeIndex: number;
}

export function PaginationDots({ total, activeIndex }: PaginationDotsProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          testID="pagination-dot"
          style={[
            styles.dot,
            {
              backgroundColor:
                index === activeIndex
                  ? colors.primary.base
                  : colors.neutral.gray[300],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
