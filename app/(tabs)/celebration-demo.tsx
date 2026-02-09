import { useState } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { CelebrationDialog } from '@/components/celebration';
import { Button } from '@/components/Button';
import { colors, spacing, typographyPresets } from '@/lib/theme/tokens';

export default function CelebrationDemo() {
  const [visible, setVisible] = useState(false);
  const [coins, setCoins] = useState(25);
  const [title, setTitle] = useState('5 Dias Sem Fumar!');
  const [subtitle, setSubtitle] = useState('Você está incrível!');

  const showCelebration = (
    coinsAmount: number,
    titleText: string,
    subtitleText?: string
  ) => {
    setCoins(coinsAmount);
    setTitle(titleText);
    setSubtitle(subtitleText || '');
    setVisible(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Celebration Dialog Demo</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Test Scenarios</Text>

        <Button
          label="Padrão (25 moedas)"
          onPress={() =>
            showCelebration(25, '5 Dias Sem Fumar!', 'Você está incrível!')
          }
        />

        <Button
          label="Poucas Moedas (5 moedas)"
          onPress={() =>
            showCelebration(5, '1 Dia Sem Fumar!', 'Continue assim!')
          }
        />

        <Button
          label="Muitas Moedas (100 moedas)"
          onPress={() =>
            showCelebration(100, '30 Dias Sem Fumar!', 'Conquista incrível!')
          }
        />

        <Button
          label="Sem Subtítulo (25 moedas)"
          onPress={() => showCelebration(25, '7 Dias Sem Fumar!')}
        />

        <Button
          label="Valor Grande (999 moedas)"
          onPress={() =>
            showCelebration(999, '365 Dias Sem Fumar!', 'Um ano completo! 🎉')
          }
        />

        <Button
          label="Valor Único (1 moeda)"
          onPress={() =>
            showCelebration(1, 'Primeira Pergunta!', 'Bem-vindo!')
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Testing Checklist</Text>
        <Text style={styles.checklistItem}>✓ Animations run smoothly (60fps)</Text>
        <Text style={styles.checklistItem}>✓ Haptic feedback on modal open</Text>
        <Text style={styles.checklistItem}>✓ Haptic feedback on coin landing</Text>
        <Text style={styles.checklistItem}>✓ Haptic feedback on button press</Text>
        <Text style={styles.checklistItem}>✓ Auto-dismiss after 5 seconds</Text>
        <Text style={styles.checklistItem}>✓ Tapping card cancels auto-dismiss</Text>
        <Text style={styles.checklistItem}>✓ Tapping overlay closes modal</Text>
        <Text style={styles.checklistItem}>✓ Button closes modal</Text>
        <Text style={styles.checklistItem}>✓ Coins land on modal card</Text>
        <Text style={styles.checklistItem}>✓ Slot machine shows full digits</Text>
        <Text style={styles.checklistItem}>✓ Single overlay (no double)</Text>
      </View>

      <CelebrationDialog
        visible={visible}
        onDismiss={() => setVisible(false)}
        title={title}
        subtitle={subtitle}
        coinsEarned={coins}
        autoDismissDelay={5000}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.white,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heading: {
    ...typographyPresets.hero,
    color: colors.primary.base,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typographyPresets.subhead,
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral.black,
    marginBottom: spacing.sm,
  },
  checklistItem: {
    ...typographyPresets.body,
    color: colors.neutral.gray[600],
    marginLeft: spacing.sm,
  },
});
