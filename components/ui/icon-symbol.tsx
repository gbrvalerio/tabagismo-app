import React from 'react';
import { View, StyleSheet } from 'react-native';

export function IconSymbol({
  size,
  color,
  name,
}: {
  size?: number;
  color?: string;
  name: string;
}) {
  const styles = StyleSheet.create({
    icon: {
      ...(size !== undefined && { width: size, height: size }),
      ...(color !== undefined && { tintColor: color }),
    },
  });

  return <View testID="icon-symbol" style={styles.icon} />;
}
