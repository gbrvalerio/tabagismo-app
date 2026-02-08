import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Button } from '@/components/Button';
import { TextField } from '@/components/text-field';
import { colors, spacing, typography, borderRadius } from '@/lib/theme/tokens';

export default function DesignDemo() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePrimaryPress = () => {
    console.log('Primary button pressed');
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Simple validation
    const isValid = text.includes('@');
    setEmailError(!isValid && text.length > 0 ? 'Por favor, digite um email válido' : '');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Design System</Text>
          <Text style={styles.subtitle}>
            Sistema de design gamificado para cessação do tabagismo
          </Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Botões</Text>

          <Button variant="primary" label="Primary Button" onPress={handlePrimaryPress} />

          <Button variant="secondary" label="Secondary Button" onPress={() => console.log('Secondary')} />

          <Button variant="outline" label="Outline Button" onPress={() => console.log('Outline')} />

          <Button variant="minimal" label="Minimal Button" onPress={() => console.log('Minimal')} />

          <Button variant="primary" label="Disabled Button" onPress={() => {}} disabled />

          <Button variant="primary" label="Loading Button" onPress={() => {}} loading={loading} />
        </View>

        {/* Text Fields Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Campos de Texto</Text>

          <TextField
            label="Nome"
            placeholder="Digite seu nome"
            value={name}
            onChangeText={setName}
            helperText="Seu nome completo"
          />

          <TextField
            label="Email"
            placeholder="seu@email.com"
            value={email}
            onChangeText={handleEmailChange}
            error={emailError}
            helperText="Usaremos para enviar lembretes"
          />

          <TextField
            label="Idade"
            placeholder="0"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />

          <TextField
            label="Carregando..."
            placeholder="Validando dados"
            loading
          />

          <TextField
            label="Desabilitado"
            placeholder="Campo desabilitado"
            disabled
            value="Não editável"
          />
        </View>

        {/* Color Palette Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paleta de Cores</Text>

          <View style={styles.colorGrid}>
            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.primary.base }]} />
              <Text style={styles.colorLabel}>Primary</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.secondary.base }]} />
              <Text style={styles.colorLabel}>Secondary</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.gold }]} />
              <Text style={styles.colorLabel}>Gold</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.purple }]} />
              <Text style={styles.colorLabel}>Purple</Text>
            </View>

            <View style={styles.colorItem}>
              <View style={[styles.colorSwatch, { backgroundColor: colors.accent.pink }]} />
              <Text style={styles.colorLabel}>Pink</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.primary.base,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.black,
    color: colors.neutral.black,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.gray[600],
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  section: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.black,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  colorItem: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    borderColor: colors.neutral.gray[300],
    marginBottom: spacing.xs,
  },
  colorLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral.gray[700],
  },
});
