import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
  typographyPresets,
} from '@/lib/theme/tokens';
import * as Haptics from '@/lib/haptics';
import { logError } from '@/lib/error-handler';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

type PermissionStatus = 'undetermined' | 'denied' | 'granted';

export default function NotificationsScreen() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status as PermissionStatus);
      } catch (error) {
        logError(error, 'NotificationsSettings');
      }
    };

    checkPermission();
  }, []);

  // Re-check permission when returning from OS settings
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          try {
            const { status } = await Notifications.getPermissionsAsync();
            setPermissionStatus(status as PermissionStatus);
          } catch (error) {
            logError(error, 'NotificationsSettings');
          }
        }
      }
    );

    return () => subscription.remove();
  }, []);

  const handleToggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (permissionStatus === 'denied') {
        await Linking.openSettings();
      } else if (permissionStatus === 'undetermined') {
        const { status } = await Notifications.requestPermissionsAsync();
        setPermissionStatus(status as PermissionStatus);
      }
    } catch (error) {
      logError(error, 'NotificationsSettings');
    }
  };

  const getSubtitle = (): string => {
    switch (permissionStatus) {
      case 'granted':
        return 'Ativadas';
      case 'denied':
        return 'Desativadas — toque para abrir configurações';
      default:
        return 'Desativadas';
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Notificações' }} />
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Toggle Section */}
          <View style={styles.toggleSection}>
            <View style={styles.toggleRow}>
              <Text style={styles.bellEmoji}>🔔</Text>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.toggleTitle}>Notificações</Text>
                <Text style={styles.toggleSubtitle}>{getSubtitle()}</Text>
              </View>
              <Switch
                testID="notification-switch"
                value={permissionStatus === 'granted'}
                onValueChange={handleToggle}
                trackColor={{
                  false: colors.neutral.gray[300],
                  true: colors.primary.base,
                }}
              />
            </View>
          </View>

          <View style={styles.separator} />

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>Benefícios</Text>
            <View style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>
                Lembretes diários personalizados
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>
                Notificações de conquistas
              </Text>
            </View>
            <View style={styles.benefitRow}>
              <Text style={styles.checkmark}>✓</Text>
              <Text style={styles.benefitText}>
                Acompanhamento de progresso
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  toggleSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellEmoji: {
    fontSize: 24,
  },
  toggleTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  toggleTitle: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.md,
    color: colors.neutral.black,
  },
  toggleSubtitle: {
    ...typographyPresets.small,
    color: colors.neutral.gray[500],
    marginTop: 2,
  },
  separator: {
    height: 8,
    backgroundColor: colors.neutral.gray[100],
  },
  benefitsSection: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  benefitsTitle: {
    fontFamily: typography.fontFamily.poppins.semibold,
    fontSize: typography.fontSize.sm,
    color: colors.neutral.gray[500],
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
