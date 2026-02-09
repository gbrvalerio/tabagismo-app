import { CelebrationDialog } from '@/components/celebration';
import { useAwardCoins, useHasNotificationReward } from '@/db/repositories';
import { TransactionType } from '@/db/schema/coin-transactions';
import { logError } from '@/lib/error-handler';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typographyPresets,
} from '@/lib/theme/tokens';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type PermissionStatus = 'undetermined' | 'denied' | 'granted';

export default function NotificationPermissionScreen() {
  const [permissionStatus, setPermissionStatus] =
    useState<PermissionStatus>('undetermined');
  const [showCelebration, setShowCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();
  const router = useRouter();
  const initialCheckDone = React.useRef(false);

  // Check permission on mount only (not when hasReward changes)
  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const checkPermission = async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        setPermissionStatus(status as PermissionStatus);

        // If already granted and not rewarded, show celebration
        if (status === 'granted' && !hasReward) {
          await awardCoins.mutateAsync({
            amount: 15,
            type: TransactionType.NOTIFICATION_PERMISSION,
            metadata: {
              source: 'notification_permission',
              grantedAt: new Date().toISOString(),
            },
          });
          setShowCelebration(true);
        } else if (status === 'granted' && hasReward) {
          // Already rewarded, skip to tabs
          // @ts-expect-error - Route group (tabs) is not in typed routes
          router.replace('/(tabs)');
        }
      } catch (error) {
        logError(error, 'NotificationPermission');
      }
    };

    checkPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  const handleRequestPermission = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setPermissionStatus(status as PermissionStatus);

      if (status === 'granted' && !hasReward) {
        await awardCoins.mutateAsync({
          amount: 15,
          type: TransactionType.NOTIFICATION_PERMISSION,
          metadata: {
            source: 'notification_permission',
            grantedAt: new Date().toISOString(),
          },
        });
        setShowCelebration(true);
      } else if (status === 'denied') {
        setPermissionStatus('denied');
      }
    } catch (error) {
      logError(error, 'NotificationPermission');
      Alert.alert(
        'Erro',
        'Não foi possível solicitar permissão. Tente novamente.'
      );
    }
  };

  const handleOpenSettings = async () => {
    try {
      await Linking.openSettings();
    } catch (error) {
      logError(error, 'NotificationPermission');
      Alert.alert(
        'Erro',
        'Não foi possível abrir as configurações. Abra manualmente.'
      );
    }
  };

  const handleSkip = () => {
    // @ts-expect-error - Route group (tabs) is not in typed routes
    router.replace('/(tabs)');
  };

  const handleCelebrationDismiss = () => {
    setShowCelebration(false);
    // @ts-expect-error - Route group (tabs) is not in typed routes
    router.replace('/(tabs)');
  };

  return (
    <>
      <LinearGradient
        colors={['#FFFFFF', '#F8F9FB']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Bell Icon Placeholder */}
            <View style={styles.iconContainer}>
              <Text style={styles.bellEmoji}>🔔</Text>
            </View>

            <Text style={styles.title}>Ative as Notificações</Text>

            <Text style={styles.description}>
              Receba lembretes e conquiste suas metas mais facilmente!
            </Text>

            {/* Benefits Card */}
            <View style={styles.benefitsCard}>
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

            {/* Coin Reward Badge */}
            <LinearGradient
              colors={['#F7A531', '#F39119']}
              style={styles.rewardBadge}
            >
              <Text style={styles.rewardText}>
                🪙 Ganhe 15 moedas ao ativar!
              </Text>
            </LinearGradient>

            {/* Helper text for denied state */}
            {permissionStatus === 'denied' && (
              <Text style={styles.helperText}>
                Você negou anteriormente. Ative nas configurações do app.
              </Text>
            )}

            {/* Primary Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={
                permissionStatus === 'denied'
                  ? handleOpenSettings
                  : handleRequestPermission
              }
            >
              <LinearGradient
                colors={['#F7A531', '#F39119']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {permissionStatus === 'denied'
                    ? 'Abrir Configurações'
                    : 'Permitir Notificações'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Secondary Button */}
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleSkip}
            >
              <Text style={styles.secondaryButtonText}>Pular por Agora</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      {/* Celebration Dialog */}
      <CelebrationDialog
        visible={showCelebration}
        title="Notificações Ativadas!"
        subtitle="Agora você receberá lembretes importantes!"
        coinsEarned={15}
        autoDismissDelay={0}
        onDismiss={handleCelebrationDismiss}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  bellEmoji: {
    fontSize: 80,
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
    marginBottom: spacing.md,
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
  rewardBadge: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  rewardText: {
    ...typographyPresets.coinCounter,
    fontSize: 14,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  helperText: {
    ...typographyPresets.small,
    fontSize: 13,
    color: colors.neutral.gray[500],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  primaryButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: '100%',
    marginBottom: spacing.md,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.97 }],
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    ...typographyPresets.button,
    color: colors.neutral.white,
  },
  secondaryButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  secondaryButtonText: {
    ...typographyPresets.body,
    fontSize: 14,
    color: colors.neutral.gray[600],
    textAlign: 'center',
  },
});
