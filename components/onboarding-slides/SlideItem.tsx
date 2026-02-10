import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SvgProps } from 'react-native-svg';
import Onboarding1 from '@/assets/images/onboarding-1.svg';
import Onboarding2 from '@/assets/images/onboarding-2.svg';
import Onboarding3 from '@/assets/images/onboarding-3.svg';
import { colors, spacing, borderRadius, shadows, typographyPresets } from '@/lib/theme/tokens';

const iconMap: Record<string, React.FC<SvgProps>> = {
  '@/assets/images/onboarding-1.svg': Onboarding1,
  '@/assets/images/onboarding-2.svg': Onboarding2,
  '@/assets/images/onboarding-3.svg': Onboarding3,
};

interface SlideItemProps {
  icon: string;
  title: string;
  description: string;
  showBenefits?: boolean;
  benefits?: string[];
}

export function SlideItem({
  icon,
  title,
  description,
  showBenefits,
  benefits,
}: SlideItemProps) {
  const { width } = useWindowDimensions();
  const IconComponent = iconMap[icon];

  return (
    <View style={[styles.container, { width }]}>
      {IconComponent ? (
        <IconComponent width={120} height={120} testID="slide-icon" />
      ) : (
        <View style={styles.iconPlaceholder} testID="icon-placeholder" />
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      {showBenefits && benefits && benefits.length > 0 && (
        <View style={styles.benefitsCard} testID="benefits-card">
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.neutral.gray[200],
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  title: {
    ...typographyPresets.hero,
    color: colors.neutral.black,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  benefitsCard: {
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginTop: spacing.md,
    ...shadows.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkmark: {
    fontSize: 18,
    color: colors.primary.base,
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typographyPresets.small,
    color: colors.neutral.gray[700],
    flex: 1,
  },
});
