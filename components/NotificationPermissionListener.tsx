import { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import * as Notifications from "expo-notifications";
import { usePathname } from "expo-router";

import { CelebrationDialog } from "@/components/celebration";
import { useAwardCoins, useHasNotificationReward } from "@/db/repositories";
import { TransactionType } from "@/db/schema/coin-transactions";

/**
 * Listens for notification permission changes via AppState
 * and awards coins when permission is granted from Settings.
 *
 * Skips handling when on the notification-permission screen,
 * which has its own AppState listener and celebration flow.
 *
 * Must be rendered inside QueryClientProvider.
 */
export function NotificationPermissionListener() {
  const statusRef = useRef<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [notificationCelebration, setNotificationCelebration] = useState(false);
  const { data: hasReward } = useHasNotificationReward();
  const awardCoins = useAwardCoins();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize permission status
    (async () => {
      try {
        const { status } = await Notifications.getPermissionsAsync();
        statusRef.current = status as 'granted' | 'denied' | 'undetermined';
      } catch (error) {
        console.error('Failed to get initial permission status:', error);
      }
    })();

    // Listen for app state changes
    const subscription = AppState.addEventListener(
      'change',
      async (nextAppState: AppStateStatus) => {
        if (nextAppState === 'active') {
          try {
            const { status } = await Notifications.getPermissionsAsync();
            const previousStatus = statusRef.current;

            // Check if permission changed from not-granted to granted
            // Skip if on notification-permission screen (it handles its own flow)
            if (previousStatus !== 'granted' && status === 'granted') {
              if (pathname === '/notification-permission') {
                statusRef.current = status as 'granted' | 'denied' | 'undetermined';
                return;
              }
              // Check if already rewarded
              if (!hasReward) {
                // Award coins and show celebration
                await awardCoins.mutateAsync({
                  amount: 15,
                  type: TransactionType.NOTIFICATION_PERMISSION,
                  metadata: {
                    source: 'settings_activation',
                    detectedAt: new Date().toISOString(),
                  },
                });
                setNotificationCelebration(true);
              }
            }

            // Update status ref
            statusRef.current = status as 'granted' | 'denied' | 'undetermined';
          } catch (error) {
            console.error('Failed to check permission status:', error);
          }
        }
      }
    );

    return () => subscription.remove();
  }, [hasReward, awardCoins, pathname]);

  return (
    <CelebrationDialog
      visible={notificationCelebration}
      title="Notificações Ativadas!"
      subtitle="Agora você receberá lembretes importantes!"
      coinsEarned={15}
      autoDismissDelay={0}
      onDismiss={() => setNotificationCelebration(false)}
    />
  );
}
